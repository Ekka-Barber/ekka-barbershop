import { BookingData } from "./types";

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

export const processServiceHeatmapData = (interactionEvents: any[]) => {
  const heatmapData = interactionEvents.reduce((acc, event) => {
    if (event.interaction_type === 'service_select' && event.interaction_details?.serviceName) {
      const serviceName = event.interaction_details.serviceName;
      if (!acc[serviceName]) {
        acc[serviceName] = 0;
      }
      acc[serviceName]++;
    }
    return acc;
  }, {} as Record<string, number>);

  // Convert to array of objects for recharts
  return Object.entries(heatmapData).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);
};

export const processCustomerJourney = (interactionEvents: any[]) => {
  const nodes = new Map();
  const links: { source: string, target: string, value: number }[] = [];

  interactionEvents.forEach(event => {
    const page = event.page_url;
    if (!nodes.has(page)) {
      nodes.set(page, { id: page });
    }
  });

  for (let i = 0; i < interactionEvents.length - 1; i++) {
    const sourceEvent = interactionEvents[i];
    const targetEvent = interactionEvents[i + 1];

    const sourcePage = sourceEvent.page_url;
    const targetPage = targetEvent.page_url;

    if (sourcePage && targetPage) {
      const existingLink = links.find(link => link.source === sourcePage && link.target === targetPage);

      if (existingLink) {
        existingLink.value += 1;
      } else {
        links.push({ source: sourcePage, target: targetPage, value: 1 });
      }
    }
  }

  return { nodes: Array.from(nodes.values()), links };
};
