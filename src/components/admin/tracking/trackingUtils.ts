
import { ServiceTracking, BookingBehavior, BookingData, ServiceStats, StepStats } from "./types";

export const processServiceStats = (serviceTracking: ServiceTracking[] | null): ServiceStats[] => {
  if (!serviceTracking) return [];
  
  const stats = new Map<string, { added: number; removed: number }>();
  
  serviceTracking.forEach((track) => {
    if (!stats.has(track.service_name)) {
      stats.set(track.service_name, { added: 0, removed: 0 });
    }
    const current = stats.get(track.service_name)!;
    if (track.action === 'added') {
      current.added++;
    } else if (track.action === 'removed') {
      current.removed++;
    }
  });

  return Array.from(stats.entries()).map(([name, counts]) => ({
    name,
    added: counts.added,
    removed: counts.removed,
    net: counts.added - counts.removed
  }));
};

export const processBookingSteps = (bookingBehavior: BookingBehavior[] | null): StepStats[] => {
  if (!bookingBehavior) return [];
  
  const stepCounts = new Map<string, number>();
  bookingBehavior.forEach((behavior) => {
    stepCounts.set(behavior.step, (stepCounts.get(behavior.step) || 0) + 1);
  });

  return Array.from(stepCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

export const processDeviceStats = (bookingsData: BookingData[] | null) => {
  if (!bookingsData) return { mobile: 0, desktop: 0 };
  
  return bookingsData.reduce((acc, booking) => {
    acc[booking.device_type] = (acc[booking.device_type] || 0) + 1;
    return acc;
  }, { mobile: 0, desktop: 0 });
};

export const processTimePatterns = (bookingsData: BookingData[] | null) => {
  if (!bookingsData) return [];
  
  const hourCounts = new Map<number, number>();
  bookingsData.forEach((booking) => {
    const hour = new Date(booking.created_at).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({
      hour: hour,
      count: count,
      label: `${hour}:00`
    }))
    .sort((a, b) => a.hour - b.hour);
};

export const calculateBookingValues = (bookingsData: BookingData[] | null) => {
  if (!bookingsData || bookingsData.length === 0) return { average: 0, total: 0 };
  
  const total = bookingsData.reduce((sum, booking) => sum + booking.total_price, 0);
  return {
    average: total / bookingsData.length,
    total: total
  };
};

export const processServiceHeatmapData = (serviceDiscovery: any[] | null) => {
  if (!serviceDiscovery) return [];

  const serviceStats = new Map();
  
  serviceDiscovery.forEach(event => {
    if (!serviceStats.has(event.service_id)) {
      serviceStats.set(event.service_id, {
        serviceName: event.selected_service_name || 'Unknown Service',
        viewCount: 0,
        bookingCount: 0,
        totalViewDuration: 0,
        viewSessions: 0
      });
    }
    
    const stats = serviceStats.get(event.service_id);
    stats.viewCount++;
    
    if (event.interaction_type === 'service_selection') {
      stats.bookingCount++;
    }
    
    if (event.view_duration_seconds) {
      stats.totalViewDuration += event.view_duration_seconds;
      stats.viewSessions++;
    }
  });

  return Array.from(serviceStats.values()).map(stats => ({
    serviceName: stats.serviceName,
    viewCount: stats.viewCount,
    conversionRate: (stats.bookingCount / stats.viewCount) * 100,
    averageViewDuration: stats.viewSessions > 0 
      ? stats.totalViewDuration / stats.viewSessions 
      : 0
  }));
};

export const processCustomerJourney = (journeyData: any[] | null) => {
  if (!journeyData) return { nodes: [], links: [] };

  const nodes = [
    { name: 'Entry' },
    { name: 'Service Browse' },
    { name: 'Service Select' },
    { name: 'Date/Time' },
    { name: 'Barber' },
    { name: 'Booking Complete' }
  ];

  // This is a simplified version - in reality, you'd calculate these values from actual journey data
  const links = [
    { source: 0, target: 1, value: 1000 }, // Entry → Browse
    { source: 1, target: 2, value: 800 },  // Browse → Select
    { source: 2, target: 3, value: 600 },  // Select → Date/Time
    { source: 3, target: 4, value: 400 },  // Date/Time → Barber
    { source: 4, target: 5, value: 200 }   // Barber → Complete
  ];

  return { nodes, links };
};
