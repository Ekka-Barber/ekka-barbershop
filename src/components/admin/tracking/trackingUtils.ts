
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

  return Object.entries(serviceData).map(([name, data]) => ({
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
    const page = event.page_url;
    if (!nodeMap.has(page)) {
      const index = nodes.length;
      nodeMap.set(page, index);
      nodes.push({ id: page, name: page, index });
    }
  });

  // Second pass: create links using numeric indices
  for (let i = 0; i < interactionEvents.length - 1; i++) {
    const sourceEvent = interactionEvents[i];
    const targetEvent = interactionEvents[i + 1];

    const sourcePage = sourceEvent.page_url;
    const targetPage = targetEvent.page_url;

    if (sourcePage && targetPage) {
      const sourceIndex = nodeMap.get(sourcePage)!;
      const targetIndex = nodeMap.get(targetPage)!;

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

  return { nodes, links };
};
