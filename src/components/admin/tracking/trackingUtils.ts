
import { BookingData, JourneyNode, JourneyLink, ServiceAnalytics } from "./types";

export const processTimePatterns = (bookingData: BookingData[]) => {
  const timePatterns = bookingData.reduce((acc, booking) => {
    const hour = parseInt(booking.appointment_time.split(':')[0]);
    const deviceType = booking.device_type;
    
    if (!acc[hour]) {
      acc[hour] = {
        hour,
        total: 0,
        mobile: 0,
        tablet: 0,
        desktop: 0
      };
    }
    
    acc[hour].total++;
    acc[hour][deviceType]++;
    
    return acc;
  }, {} as Record<number, { hour: number; total: number; mobile: number; tablet: number; desktop: number; }>);

  return Object.values(timePatterns).sort((a, b) => a.hour - b.hour);
};

interface ServiceData {
  viewCount: number;
  totalDuration: number;
  bookings: number;
}

export const processServiceHeatmapData = (interactionEvents: any[]): ServiceAnalytics[] => {
  const serviceData = interactionEvents.reduce((acc, event) => {
    if (event.interaction_type === 'service_select' && event.interaction_details?.serviceName) {
      const serviceName = event.interaction_details.serviceName;
      if (!acc[serviceName]) {
        acc[serviceName] = {
          viewCount: 0,
          totalDuration: 0,
          bookings: 0
        };
      }
      const data = acc[serviceName] as ServiceData;
      data.viewCount++;
      if (event.interaction_details.duration) {
        data.totalDuration += event.interaction_details.duration;
      }
      if (event.interaction_details.booked) {
        data.bookings++;
      }
    }
    return acc;
  }, {} as Record<string, ServiceData>);

  return Object.entries(serviceData).map(([name, data]: [string, ServiceData]) => ({
    serviceName: name,
    viewCount: data.viewCount,
    conversionRate: (data.bookings / data.viewCount) * 100,
    averageViewDuration: data.totalDuration / data.viewCount
  }));
};

export const processCustomerJourney = (interactionEvents: any[]): { nodes: JourneyNode[]; links: JourneyLink[] } => {
  const nodeMap = new Map<string, number>();
  const nodes: JourneyNode[] = [];
  const links: JourneyLink[] = [];

  // First pass: create nodes with numeric indices
  interactionEvents.forEach(event => {
    if (event.page_url) {
      if (!nodeMap.has(event.page_url)) {
        const index = nodes.length;
        nodeMap.set(event.page_url, index);
        nodes.push({ 
          id: event.page_url, 
          name: event.page_url.split('/').pop() || event.page_url,
          index 
        });
      }
    }
  });

  // Second pass: create links using numeric indices
  for (let i = 0; i < interactionEvents.length - 1; i++) {
    const sourceEvent = interactionEvents[i];
    const targetEvent = interactionEvents[i + 1];

    if (sourceEvent.page_url && targetEvent.page_url) {
      const sourceIndex = nodeMap.get(sourceEvent.page_url);
      const targetIndex = nodeMap.get(targetEvent.page_url);

      if (typeof sourceIndex === 'number' && typeof targetIndex === 'number') {
        const existingLink = links.find(link => 
          link.source === sourceIndex && link.target === targetIndex
        );

        if (existingLink) {
          existingLink.value += 1;
        } else {
          links.push({ 
            source: sourceIndex,
            target: targetIndex,
            value: 1 
          });
        }
      }
    }
  }

  return { nodes, links };
};

export const processUserBehavior = (pageViews: any[], interactionEvents: any[]) => {
  // Combine page views and interactions to create a complete journey
  const sessions = new Map<string, {
    views: any[],
    interactions: any[]
  }>();

  // Group by session
  pageViews.forEach(view => {
    if (view.session_id) {
      if (!sessions.has(view.session_id)) {
        sessions.set(view.session_id, { views: [], interactions: [] });
      }
      sessions.get(view.session_id)!.views.push(view);
    }
  });

  interactionEvents.forEach(event => {
    if (event.session_id) {
      if (!sessions.has(event.session_id)) {
        sessions.set(event.session_id, { views: [], interactions: [] });
      }
      sessions.get(event.session_id)!.interactions.push(event);
    }
  });

  // Process session data
  return Array.from(sessions.entries()).map(([sessionId, data]) => {
    const { views, interactions } = data;
    const duration = views.length > 0 ? 
      new Date(views[views.length - 1].exit_time || views[views.length - 1].entry_time).getTime() - 
      new Date(views[0].entry_time).getTime() : 0;

    return {
      sessionId,
      pageCount: views.length,
      interactionCount: interactions.length,
      duration,
      deviceType: views[0]?.device_type || interactions[0]?.device_type,
      startTime: views[0]?.entry_time || interactions[0]?.timestamp
    };
  });
};
