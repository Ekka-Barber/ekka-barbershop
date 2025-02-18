
import { ProcessedJourneyData, DropOffPoint, ServiceBundle, TimePattern, JourneyNode, JourneyLink } from "./types";
import { supabase } from "@/integrations/supabase/client";

interface BookingData {
  appointment_time: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
}

interface ServiceAnalytics {
  serviceName: string;
  viewCount: number;
  conversionRate: number;
  averageViewDuration: number;
}

export const processTimePatterns = (bookingData: BookingData[]): TimePattern[] => {
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
  }, {} as Record<number, TimePattern>);

  return Object.values(timePatterns).sort((a, b) => a.hour - b.hour);
};

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
      const data = acc[serviceName];
      data.viewCount++;
      if (event.interaction_details.duration) {
        data.totalDuration += event.interaction_details.duration;
      }
      if (event.interaction_details.booked) {
        data.bookings++;
      }
    }
    return acc;
  }, {} as Record<string, { viewCount: number; totalDuration: number; bookings: number; }>);

  return Object.entries(serviceData).map(([name, data]) => ({
    serviceName: name,
    viewCount: data.viewCount,
    conversionRate: (data.bookings / data.viewCount) * 100,
    averageViewDuration: data.totalDuration / data.viewCount
  }));
};

export const processCustomerJourney = (interactionEvents: any[]): ProcessedJourneyData => {
  const { nodes, links, dropOffPoints, serviceBundles } = processBaseJourneyData(interactionEvents);
  const pathOptimizations = generatePathOptimizations(interactionEvents, dropOffPoints, serviceBundles);
  
  return {
    nodes,
    links,
    dropOffPoints: dropOffPoints.map(point => ({
      ...point,
      rate: point.exitRate // Ensure rate is set to match exitRate
    })),
    serviceBundles,
    pathOptimizations
  };
};

const processBaseJourneyData = (interactionEvents: any[]) => {
  const nodeMap = new Map<string, number>();
  const nodes: JourneyNode[] = [];
  const links: JourneyLink[] = [];
  const dropOffPoints: DropOffPoint[] = [];
  const serviceBundles: ServiceBundle[] = [];

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

  const pageExits = new Map<string, { count: number; totalTime: number; paths: string[][] }>();
  
  interactionEvents.forEach((event, index) => {
    if (index < interactionEvents.length - 1) {
      const timeDiff = new Date(interactionEvents[index + 1].timestamp).getTime() - 
                      new Date(event.timestamp).getTime();
      
      if (timeDiff > 30 * 60 * 1000) { // 30 minutes threshold
        const page = event.page_url;
        const path = interactionEvents.slice(0, index + 1).map(e => e.page_url);
        
        if (!pageExits.has(page)) {
          pageExits.set(page, { count: 0, totalTime: 0, paths: [] });
        }
        
        const exitData = pageExits.get(page)!;
        exitData.count++;
        exitData.totalTime += timeDiff;
        exitData.paths.push(path);
      }
    }
  });

  pageExits.forEach((data, page) => {
    const exitRate = (data.count / interactionEvents.length) * 100;
    dropOffPoints.push({
      page,
      rate: data.count,
      exitRate,
      averageTimeBeforeExit: data.totalTime / data.count,
      previousPages: data.paths[0] || []
    });
  });

  const serviceSelections = interactionEvents.filter(
    event => event.interaction_type === 'service_select'
  );

  const bundleMap = new Map<string, {
    count: number;
    totalValue: number;
    conversionCount: number;
    timeToBook: number[];
    repeatBookings: number;
  }>();

  serviceSelections.forEach(event => {
    if (event.interaction_details?.services) {
      const services = event.interaction_details.services;
      const bundleKey = services.sort().join('+');
      
      if (!bundleMap.has(bundleKey)) {
        bundleMap.set(bundleKey, {
          count: 0,
          totalValue: 0,
          conversionCount: 0,
          timeToBook: [],
          repeatBookings: 0
        });
      }
      
      const bundle = bundleMap.get(bundleKey)!;
      bundle.count++;
      bundle.totalValue += event.interaction_details.totalValue || 0;
      
      if (event.interaction_details.converted) {
        bundle.conversionCount++;
        bundle.timeToBook.push(event.interaction_details.timeToBook || 0);
      }
      
      if (event.interaction_details.isRepeatBooking) {
        bundle.repeatBookings++;
      }
    }
  });

  bundleMap.forEach((data, name) => {
    serviceBundles.push({
      name,
      frequency: data.count,
      averageValue: data.totalValue / data.count,
      conversionRate: (data.conversionCount / data.count) * 100,
      services: name.split('+'),
      performanceMetrics: {
        timeToBook: data.timeToBook.reduce((a, b) => a + b, 0) / data.timeToBook.length,
        customerSatisfaction: 0,
        repeatBookingRate: (data.repeatBookings / data.count) * 100
      }
    });
  });

  return { nodes, links, dropOffPoints, serviceBundles };
};

interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  viewCount: number;
  conversionRate: number;
  averageTimeSpent: number;
  childServices: Array<{
    serviceId: string;
    serviceName: string;
    viewCount: number;
    bookCount: number;
    conversionRate: number;
  }>;
}

export const analyzeCategoryPerformance = async (
  startDate: Date,
  endDate: Date
): Promise<CategoryPerformance[]> => {
  const { data: events, error } = await supabase
    .from('service_discovery_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (error || !events) return [];

  const categoryMap = new Map<string, CategoryPerformance>();

  events.forEach(event => {
    if (!event.category_id) return;

    if (!categoryMap.has(event.category_id)) {
      categoryMap.set(event.category_id, {
        categoryId: event.category_id,
        categoryName: '',
        viewCount: 0,
        conversionRate: 0,
        averageTimeSpent: 0,
        childServices: []
      });
    }

    const category = categoryMap.get(event.category_id)!;

    if (event.interaction_type === 'category_view') {
      category.viewCount++;
      const viewEndEvent = events.find(e => 
        e.category_id === event.category_id && 
        e.interaction_type === 'category_view_end' &&
        new Date(e.created_at).getTime() > new Date(event.created_at).getTime()
      );
      
      if (viewEndEvent) {
        const duration = (new Date(viewEndEvent.created_at).getTime() - new Date(event.created_at).getTime()) / 1000;
        category.averageTimeSpent = 
          (category.averageTimeSpent * (category.viewCount - 1) + duration) / 
          category.viewCount;
      }
    }

    if (event.service_id && event.selected_service_name) {
      const serviceIndex = category.childServices.findIndex(s => s.serviceId === event.service_id);
      if (serviceIndex === -1) {
        category.childServices.push({
          serviceId: event.service_id,
          serviceName: event.selected_service_name,
          viewCount: 1,
          bookCount: event.interaction_type === 'service_selection' ? 1 : 0,
          conversionRate: 0
        });
      } else {
        const service = category.childServices[serviceIndex];
        service.viewCount++;
        if (event.interaction_type === 'service_selection') {
          service.bookCount++;
        }
        service.conversionRate = (service.bookCount / service.viewCount) * 100;
      }
    }
  });

  categoryMap.forEach(category => {
    const totalBookings = category.childServices.reduce((sum, service) => sum + service.bookCount, 0);
    category.conversionRate = (totalBookings / category.viewCount) * 100;
  });

  return Array.from(categoryMap.values());
};

interface TimeSlotPreference {
  hour: number;
  totalSelections: number;
  successRate: number;
  averageDecisionTime: number;
  deviceDistribution: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export const analyzeTimeSlotPreferences = async (
  startDate: Date,
  endDate: Date
): Promise<TimeSlotPreference[]> => {
  const { data: events } = await supabase
    .from('datetime_tracking')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (!events) return [];

  const timeSlotMap = new Map<number, TimeSlotPreference>();

  events.forEach(event => {
    if (!event.selected_time) return;

    const hour = parseInt(event.selected_time.split(':')[0]);
    
    if (!timeSlotMap.has(hour)) {
      timeSlotMap.set(hour, {
        hour,
        totalSelections: 0,
        successRate: 0,
        averageDecisionTime: 0,
        deviceDistribution: {
          mobile: 0,
          tablet: 0,
          desktop: 0
        }
      });
    }

    const slot = timeSlotMap.get(hour)!;
    slot.totalSelections++;

    if (event.view_duration_seconds) {
      slot.averageDecisionTime = 
        (slot.averageDecisionTime * (slot.totalSelections - 1) + event.view_duration_seconds) / 
        slot.totalSelections;
    }

    if (event.device_type) {
      slot.deviceDistribution[event.device_type]++;
    }
  });

  return Array.from(timeSlotMap.values())
    .sort((a, b) => a.hour - b.hour)
    .map(slot => ({
      ...slot,
      deviceDistribution: {
        mobile: (slot.deviceDistribution.mobile / slot.totalSelections) * 100,
        tablet: (slot.deviceDistribution.tablet / slot.totalSelections) * 100,
        desktop: (slot.deviceDistribution.desktop / slot.totalSelections) * 100
      }
    }));
};

interface BarberSelectionPattern {
  barberId: string;
  totalViews: number;
  totalSelections: number;
  conversionRate: number;
  averageDecisionTime: number;
  preferredTimeSlots: string[];
  selectionCriteria: {
    availabilityBased: number;
    nationalityBased: number;
    timeSlotBased: number;
  };
}

export const analyzeBarberSelectionPatterns = async (
  startDate: Date,
  endDate: Date
): Promise<BarberSelectionPattern[]> => {
  const { data: events } = await supabase
    .from('barber_selection_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString());

  if (!events) return [];

  const barberMap = new Map<string, BarberSelectionPattern>();

  events.forEach(event => {
    if (!barberMap.has(event.barber_id)) {
      barberMap.set(event.barber_id, {
        barberId: event.barber_id,
        totalViews: 0,
        totalSelections: 0,
        conversionRate: 0,
        averageDecisionTime: 0,
        preferredTimeSlots: [],
        selectionCriteria: {
          availabilityBased: 0,
          nationalityBased: 0,
          timeSlotBased: 0
        }
      });
    }

    const pattern = barberMap.get(event.barber_id)!;

    if (event.interaction_type === 'profile_view') {
      pattern.totalViews++;
    } else if (event.interaction_type === 'selection') {
      pattern.totalSelections++;
    }

    if (event.view_duration_seconds) {
      pattern.averageDecisionTime = 
        (pattern.averageDecisionTime * (pattern.totalViews - 1) + event.view_duration_seconds) / 
        pattern.totalViews;
    }

    if (event.preferred_time_slots) {
      pattern.preferredTimeSlots = [...new Set([...pattern.preferredTimeSlots, ...event.preferred_time_slots])];
    }

    if (event.selection_criteria && typeof event.selection_criteria === 'object') {
      const criteria = event.selection_criteria as Record<string, boolean>;
      if (criteria.availability_based) {
        pattern.selectionCriteria.availabilityBased++;
      }
      if (criteria.nationality_based) {
        pattern.selectionCriteria.nationalityBased++;
      }
      if (criteria.time_slot_based) {
        pattern.selectionCriteria.timeSlotBased++;
      }
    }
  });

  return Array.from(barberMap.values()).map(pattern => ({
    ...pattern,
    conversionRate: (pattern.totalSelections / pattern.totalViews) * 100,
    selectionCriteria: {
      availabilityBased: (pattern.selectionCriteria.availabilityBased / pattern.totalSelections) * 100,
      nationalityBased: (pattern.selectionCriteria.nationalityBased / pattern.totalSelections) * 100,
      timeSlotBased: (pattern.selectionCriteria.timeSlotBased / pattern.totalSelections) * 100
    }
  }));
};

interface PathOptimization {
  currentPath: string[];
  suggestedPath: string[];
  potentialImpact: {
    conversionRate: number;
    timeToBook: number;
    dropOffReduction: number;
  };
  reasoning: string;
  priority: 'high' | 'medium';
}

const generatePathOptimizations = (
  interactionEvents: any[],
  dropOffPoints: DropOffPoint[],
  serviceBundles: ServiceBundle[]
): PathOptimization[] => {
  const optimizations: PathOptimization[] = [];

  dropOffPoints
    .filter(point => point.exitRate > 30)
    .forEach(point => {
      const currentPath = point.previousPages;
      const suggestedPath = [...currentPath];
      
      const successfulPaths = interactionEvents
        .filter(event => event.interaction_type === 'service_selection_complete')
        .map(event => event.interaction_details?.path || []);
      
      const betterPath = successfulPaths.find(path => 
        path.includes(point.page) && 
        calculatePathEfficiency(path) > calculatePathEfficiency(currentPath)
      );

      if (betterPath) {
        optimizations.push({
          currentPath,
          suggestedPath: betterPath,
          potentialImpact: {
            conversionRate: estimateConversionImprovement(currentPath, betterPath, interactionEvents),
            timeToBook: estimateTimeToBookImprovement(currentPath, betterPath, interactionEvents),
            dropOffReduction: point.exitRate * 0.4
          },
          reasoning: `High drop-off rate of ${point.exitRate.toFixed(1)}% detected. Suggested path shows ${calculatePathEfficiency(betterPath).toFixed(1)}% better conversion rate.`,
          priority: point.exitRate > 50 ? 'high' : 'medium'
        });
      }
    });

  serviceBundles
    .filter(bundle => bundle.conversionRate < 30)
    .forEach(bundle => {
      const successfulBundles = serviceBundles
        .filter(b => b.conversionRate > 50)
        .sort((a, b) => b.frequency - a.frequency);

      if (successfulBundles.length > 0) {
        const recommendedBundle = successfulBundles[0];
        optimizations.push({
          currentPath: bundle.services,
          suggestedPath: recommendedBundle.services,
          potentialImpact: {
            conversionRate: recommendedBundle.conversionRate - bundle.conversionRate,
            timeToBook: recommendedBundle.performanceMetrics.timeToBook - bundle.performanceMetrics.timeToBook,
            dropOffReduction: 15
          },
          reasoning: `Low-performing service bundle detected. Recommended bundle shows ${recommendedBundle.conversionRate.toFixed(1)}% conversion rate vs current ${bundle.conversionRate.toFixed(1)}%.`,
          priority: bundle.frequency > 10 ? 'high' : 'medium'
        });
      }
    });

  return optimizations;
};

const calculatePathEfficiency = (path: string[]): number => {
  return path.length > 0 ? 100 / path.length : 0;
};

const estimateConversionImprovement = (
  currentPath: string[],
  suggestedPath: string[],
  events: any[]
): number => {
  const currentConversion = calculatePathConversion(currentPath, events);
  const suggestedConversion = calculatePathConversion(suggestedPath, events);
  return suggestedConversion - currentConversion;
};

const calculatePathConversion = (path: string[], events: any[]): number => {
  const pathEvents = events.filter(event => 
    path.includes(event.page_url || '')
  );
  
  const completions = pathEvents.filter(event => 
    event.interaction_type === 'service_selection_complete'
  ).length;

  return pathEvents.length > 0 ? (completions / pathEvents.length) * 100 : 0;
};

const estimateTimeToBookImprovement = (
  currentPath: string[],
  suggestedPath: string[],
  events: any[]
): number => {
  const currentTime = calculateAverageTimeToBook(currentPath, events);
  const suggestedTime = calculateAverageTimeToBook(suggestedPath, events);
  return currentTime - suggestedTime;
};

const calculateAverageTimeToBook = (path: string[], events: any[]): number => {
  const pathCompletions = events.filter(event => 
    event.interaction_type === 'service_selection_complete' &&
    event.interaction_details?.path?.join(',') === path.join(',')
  );

  const times = pathCompletions.map(event => 
    event.interaction_details?.timeToBook || 0
  );

  return times.length > 0 
    ? times.reduce((a, b) => a + b, 0) / times.length 
    : 0;
};
