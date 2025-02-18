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

export interface CommonPath {
  path: string[];
  frequency: number;
  successRate: number;
  averageDuration: number;
}

export interface PathAnalysis extends CommonPath {
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
  completionRate: number;
  deviceDistribution: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  pathAnalysis: PathAnalysis;
  timePatterns: TimePattern[];
  commonPaths: CommonPath[];
  dropOffPoints: DropOffPoint[];
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
  rate: number;
  exitRate: number;
  averageTimeBeforeExit: number;
  previousPages: string[];
}

export const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];

export interface PredictiveAnalytics {
  busyPeriods: BusyPeriod[];
  revenueForecasts: RevenueForecast[];
  seasonalPatterns: SeasonalPattern[];
  trends: TrendAnalysis[];
}

export interface BusyPeriod {
  startTime: string;
  endTime: string;
  predictedBookings: number;
  confidence: number;
  dayOfWeek: number;
}

export interface RevenueForecast {
  date: string;
  predictedRevenue: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface SeasonalPattern {
  period: string;
  pattern: string;
  strength: number;
  significance: number;
}

export interface TrendAnalysis {
  metric: string;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
  confidence: number;
}

export interface GeographicInsightsType {
  branchLocations: BranchLocation[];
  customerDensity: DensityPoint[];
  performanceMetrics: LocationPerformance[];
  catchmentAreas: CatchmentArea[];
}

export interface BranchLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  performance: {
    bookings: number;
    revenue: number;
    satisfaction: number;
  };
}

export interface DensityPoint {
  coordinates: [number, number];
  weight: number;
}

export interface LocationPerformance {
  branchId: string;
  metrics: {
    bookingsPerCapita: number;
    marketShare: number;
    competitorProximity: number;
  };
}

export interface CatchmentArea {
  branchId: string;
  polygon: [number, number][];
  population: number;
  potentialMarket: number;
}

export interface PredictiveAnalyticsProps {
  data?: {
    busyPeriods: BusyPeriod[];
    revenueForecasts: RevenueForecast[];
    seasonalPatterns: SeasonalPattern[];
    trends: TrendAnalysis[];
  };
}

export interface GeographicInsightsProps {
  data?: GeographicInsightsType;
}
