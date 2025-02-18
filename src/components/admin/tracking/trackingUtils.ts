
import { 
  ProcessedJourneyData, 
  DropOffPoint, 
  ServiceBundle, 
  TimePattern, 
  JourneyNode, 
  JourneyLink,
  UnifiedEvent,
  PathOptimization
} from "./types";

export const processTimePatterns = (bookingEvents: UnifiedEvent[]): TimePattern[] => {
  const timePatterns = bookingEvents.reduce((acc, event) => {
    if (!event.event_data?.appointment_time) return acc;

    const hour = parseInt(event.event_data.appointment_time.split(':')[0]);
    const deviceType = event.device_type;
    
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

export const processCustomerJourney = (events: UnifiedEvent[]): ProcessedJourneyData => {
  // Define booking flow steps
  const steps = ['service_selection', 'datetime_selection', 'barber_selection', 'details_confirmation'];
  
  // Create nodes for each step
  const nodes: JourneyNode[] = steps.map((step, index) => ({
    id: step,
    name: step.replace('_', ' ').toUpperCase(),
    index
  }));

  // Initialize links
  const linkMap = new Map<string, number>();
  
  // Process events to build links
  events.forEach((event, index) => {
    if (index === 0) return;
    const prevEvent = events[index - 1];
    
    if (prevEvent.event_data?.step && event.event_data?.step) {
      const source = steps.indexOf(prevEvent.event_data.step as string);
      const target = steps.indexOf(event.event_data.step as string);
      
      if (source >= 0 && target >= 0) {
        const linkKey = `${source}-${target}`;
        linkMap.set(linkKey, (linkMap.get(linkKey) || 0) + 1);
      }
    }
  });

  // Convert link map to array
  const links: JourneyLink[] = Array.from(linkMap.entries()).map(([key, value]) => {
    const [source, target] = key.split('-').map(Number);
    return { source, target, value };
  });

  // Calculate drop-off points
  const dropOffPoints: DropOffPoint[] = steps.map(step => {
    const stepEvents = events.filter(e => e.event_data?.step === step);
    const nextStepEvents = events.filter(e => {
      const currentIndex = steps.indexOf(step);
      const nextStep = steps[currentIndex + 1];
      return e.event_data?.step === nextStep;
    });

    return {
      page: step,
      rate: stepEvents.length ? (stepEvents.length - nextStepEvents.length) / stepEvents.length : 0,
      exitRate: stepEvents.length ? (stepEvents.length - nextStepEvents.length) / stepEvents.length : 0,
      averageTimeBeforeExit: calculateAverageTimeBeforeExit(stepEvents),
      previousPages: getPreviousPages(events, step)
    };
  });

  // Generate service bundles based on common combinations
  const serviceBundles: ServiceBundle[] = analyzeServiceBundles(events);

  // Generate path optimizations
  const pathOptimizations: PathOptimization[] = generatePathOptimizations(events, dropOffPoints);

  return {
    nodes,
    links,
    dropOffPoints,
    serviceBundles,
    pathOptimizations
  };
};

const calculateAverageTimeBeforeExit = (events: UnifiedEvent[]): number => {
  const durationsMs = events.map(event => {
    const entryTime = event.event_data?.entry_time ? new Date(event.event_data.entry_time).getTime() : 0;
    const exitTime = event.event_data?.exit_time ? new Date(event.event_data.exit_time).getTime() : 0;
    return exitTime - entryTime;
  }).filter(duration => duration > 0);

  return durationsMs.length ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 1000 : 0;
};

const getPreviousPages = (events: UnifiedEvent[], currentStep: string): string[] => {
  const stepIndex = events.findIndex(e => e.event_data?.step === currentStep);
  if (stepIndex <= 0) return [];
  
  return Array.from(new Set(
    events
      .slice(0, stepIndex)
      .map(e => e.event_data?.step as string)
      .filter(Boolean)
  ));
};

const analyzeServiceBundles = (events: UnifiedEvent[]): ServiceBundle[] => {
  const serviceCombinations = events
    .filter(e => e.event_data?.selected_services)
    .map(e => e.event_data.selected_services as string[]);

  const bundles = new Map<string, ServiceBundle>();
  
  serviceCombinations.forEach(combo => {
    if (!Array.isArray(combo)) return;
    const key = combo.sort().join(',');
    
    if (!bundles.has(key)) {
      bundles.set(key, {
        name: `Bundle ${bundles.size + 1}`,
        frequency: 1,
        averageValue: calculateAverageValue(events, combo),
        conversionRate: calculateConversionRate(events, combo),
        services: combo,
        performanceMetrics: {
          timeToBook: calculateTimeToBook(events, combo),
          customerSatisfaction: 0,
          repeatBookingRate: calculateRepeatBookingRate(events, combo)
        }
      });
    } else {
      const bundle = bundles.get(key)!;
      bundle.frequency++;
    }
  });

  return Array.from(bundles.values());
};

const calculateAverageValue = (events: UnifiedEvent[], services: string[]): number => {
  const relevantEvents = events.filter(e => 
    e.event_data?.selected_services && 
    arrayEquals(e.event_data.selected_services as string[], services)
  );
  
  const totalValue = relevantEvents.reduce((sum, event) => 
    sum + (event.event_data?.total_value as number || 0), 0);
    
  return relevantEvents.length ? totalValue / relevantEvents.length : 0;
};

const calculateConversionRate = (events: UnifiedEvent[], services: string[]): number => {
  const selections = events.filter(e => 
    e.event_data?.selected_services && 
    arrayEquals(e.event_data.selected_services as string[], services)
  ).length;
  
  const completions = events.filter(e => 
    e.event_type === 'business' && 
    e.event_name === 'booking_completed' &&
    e.event_data?.selected_services &&
    arrayEquals(e.event_data.selected_services as string[], services)
  ).length;

  return selections ? (completions / selections) * 100 : 0;
};

const calculateTimeToBook = (events: UnifiedEvent[], services: string[]): number => {
  const relevantEvents = events.filter(e => 
    e.event_data?.selected_services && 
    arrayEquals(e.event_data.selected_services as string[], services)
  );

  const durations = relevantEvents.map(event => {
    const startTime = new Date(event.event_data?.first_interaction as string || event.timestamp).getTime();
    const endTime = new Date(event.timestamp).getTime();
    return endTime - startTime;
  });

  return durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length / 1000 : 0;
};

const calculateRepeatBookingRate = (events: UnifiedEvent[], services: string[]): number => {
  const uniqueUsers = new Set(events
    .filter(e => e.user_id && e.event_data?.selected_services && 
      arrayEquals(e.event_data.selected_services as string[], services))
    .map(e => e.user_id)
  );

  const repeatUsers = new Set(events
    .filter(e => e.user_id && e.event_type === 'business' && 
      e.event_name === 'booking_completed' &&
      e.event_data?.selected_services &&
      arrayEquals(e.event_data.selected_services as string[], services))
    .map(e => e.user_id)
  );

  return uniqueUsers.size ? (repeatUsers.size / uniqueUsers.size) * 100 : 0;
};

const generatePathOptimizations = (events: UnifiedEvent[], dropOffPoints: DropOffPoint[]): PathOptimization[] => {
  return dropOffPoints
    .filter(point => point.exitRate > 0.3) // Focus on high drop-off points
    .map(point => {
      const currentPath = point.previousPages.concat(point.page);
      const suggestedPath = generateOptimizedPath(currentPath, events);
      
      return {
        currentPath,
        suggestedPath,
        potentialImpact: calculatePotentialImpact(events, currentPath, suggestedPath),
        reasoning: generateOptimizationReasoning(point, events),
        priority: determinePriority(point.exitRate)
      };
    });
};

const generateOptimizedPath = (currentPath: string[], events: UnifiedEvent[]): string[] => {
  // Implement path optimization logic based on successful conversions
  const successfulPaths = events
    .filter(e => e.event_type === 'business' && e.event_name === 'booking_completed')
    .map(e => e.event_data?.path as string[])
    .filter(Boolean);

  if (successfulPaths.length === 0) return currentPath;

  // Find the most successful path that includes all required steps
  const requiredSteps = new Set(currentPath);
  const validPaths = successfulPaths.filter(path => 
    Array.from(requiredSteps).every(step => path.includes(step))
  );

  if (validPaths.length === 0) return currentPath;

  // Return the shortest successful path
  return validPaths.reduce((shortest, current) => 
    current.length < shortest.length ? current : shortest
  );
};

const calculatePotentialImpact = (
  events: UnifiedEvent[], 
  currentPath: string[], 
  suggestedPath: string[]
): { conversionRate: number; timeToBook: number; dropOffReduction: number } => {
  const currentMetrics = calculatePathMetrics(events, currentPath);
  const suggestedMetrics = calculatePathMetrics(events, suggestedPath);

  return {
    conversionRate: suggestedMetrics.conversionRate - currentMetrics.conversionRate,
    timeToBook: currentMetrics.timeToBook - suggestedMetrics.timeToBook,
    dropOffReduction: currentMetrics.dropOffRate - suggestedMetrics.dropOffRate
  };
};

const calculatePathMetrics = (events: UnifiedEvent[], path: string[]) => {
  const pathEvents = events.filter(e => e.event_data?.path && 
    arrayEquals(e.event_data.path as string[], path));

  const conversions = pathEvents.filter(e => 
    e.event_type === 'business' && e.event_name === 'booking_completed'
  ).length;

  return {
    conversionRate: pathEvents.length ? (conversions / pathEvents.length) * 100 : 0,
    timeToBook: calculateAverageTimeToBook(pathEvents),
    dropOffRate: calculateDropOffRate(pathEvents)
  };
};

const generateOptimizationReasoning = (dropOffPoint: DropOffPoint, events: UnifiedEvent[]): string => {
  const highExitRate = dropOffPoint.exitRate > 0.5;
  const longTimeBeforeExit = dropOffPoint.averageTimeBeforeExit > 180; // 3 minutes
  
  if (highExitRate && longTimeBeforeExit) {
    return `High drop-off rate (${Math.round(dropOffPoint.exitRate * 100)}%) with users spending significant time (${Math.round(dropOffPoint.averageTimeBeforeExit)}s) before leaving. Consider simplifying this step.`;
  } else if (highExitRate) {
    return `High drop-off rate (${Math.round(dropOffPoint.exitRate * 100)}%) with quick exits. Consider improving initial engagement.`;
  } else if (longTimeBeforeExit) {
    return `Users spend ${Math.round(dropOffPoint.averageTimeBeforeExit)}s before leaving. Consider streamlining the process.`;
  }
  
  return `Moderate drop-off point with potential for optimization.`;
};

const determinePriority = (exitRate: number): 'high' | 'medium' | 'low' => {
  if (exitRate > 0.5) return 'high';
  if (exitRate > 0.3) return 'medium';
  return 'low';
};

const calculateAverageTimeToBook = (events: UnifiedEvent[]): number => {
  const bookingTimes = events
    .filter(e => e.event_type === 'business' && e.event_name === 'booking_completed')
    .map(e => {
      const startTime = new Date(e.event_data?.first_interaction as string || e.timestamp).getTime();
      const endTime = new Date(e.timestamp).getTime();
      return endTime - startTime;
    });

  return bookingTimes.length ? 
    bookingTimes.reduce((a, b) => a + b, 0) / bookingTimes.length / 1000 : 
    0;
};

const calculateDropOffRate = (events: UnifiedEvent[]): number => {
  const totalStarts = events.length;
  const completions = events.filter(e => 
    e.event_type === 'business' && e.event_name === 'booking_completed'
  ).length;

  return totalStarts ? (totalStarts - completions) / totalStarts : 0;
};

const arrayEquals = (a: any[], b: any[]): boolean => {
  return Array.isArray(a) && 
         Array.isArray(b) && 
         a.length === b.length && 
         a.every((val, index) => val === b[index]);
};

export const processServiceHeatmapData = (events: UnifiedEvent[]) => {
  const serviceInteractions = events.filter(e => 
    e.event_type === 'interaction' && 
    e.event_name === 'service_interaction'
  );

  const heatmapData = serviceInteractions.reduce((acc, event) => {
    const serviceName = event.event_data?.service_name as string;
    if (!serviceName) return acc;

    if (!acc[serviceName]) {
      acc[serviceName] = {
        name: serviceName,
        views: 0,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        averageViewDuration: 0,
        viewCount: 0
      };
    }

    const interaction = event.event_data?.interaction_type as string;
    if (interaction === 'view') acc[serviceName].views++;
    if (interaction === 'click') acc[serviceName].clicks++;
    if (interaction === 'select') acc[serviceName].conversions++;

    // Update conversion rate and view count
    acc[serviceName].viewCount = acc[serviceName].views;
    acc[serviceName].conversionRate = acc[serviceName].views > 0 
      ? (acc[serviceName].conversions / acc[serviceName].views) * 100 
      : 0;

    return acc;
  }, {} as Record<string, any>);

  // Convert to array format
  return Object.values(heatmapData);
};
