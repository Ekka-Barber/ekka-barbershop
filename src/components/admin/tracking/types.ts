
export interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

export interface BookingBehavior {
  step: string;
  timestamp: string;
}

export interface ServiceAnalytics {
  serviceName: string;
  viewCount: number;
  conversionRate: number;
  averageViewDuration: number;
}

export interface ServiceBundle {
  name: string;
  frequency: number;
  averageValue: number;
  conversionRate: number;
  services: string[];
  performanceMetrics: {
    timeToBook: number;
    customerSatisfaction: number;
    repeatBookingRate: number;
  };
}

export interface StepStats {
  name: string;
  count: number;
}

export interface ServiceStats {
  name: string;
  added: number;
  removed: number;
  net: number;
}

export interface PathOptimization {
  currentPath: string[];
  suggestedPath: string[];
  potentialImpact: {
    conversionRate: number;
    timeToBook: number;
    dropOffReduction: number;
  };
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TimePattern {
  hour: number;
  total: number;
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface BookingData {
  appointment_time: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
}

export interface PathAnalysis {
  commonPaths: string[][];
  dropOffPoints: string[];
  conversionRate: number;
  averageTimeToComplete: number;
}

export interface UserBehaviorMetrics {
  totalSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  deviceDistribution: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  pathAnalysis: PathAnalysis;
  timePatterns: TimePattern[];
}

export interface ProcessedJourneyData {
  nodes: JourneyNode[];
  links: JourneyLink[];
  dropOffPoints: DropOffPoint[];
  serviceBundles: ServiceBundle[];
  pathOptimizations: PathOptimization[];
}

export interface JourneyNode {
  id: string;
  name: string;
  index?: number;
}

export interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

export interface DropOffPoint {
  page: string;
  exitRate: number;
  averageTimeBeforeExit: number;
  previousPages: string[];
}

export const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];
