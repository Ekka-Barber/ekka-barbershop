
export interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

export interface BookingBehavior {
  step: string;
  timestamp: string;
}

export interface BookingData {
  id: string;
  device_type: 'mobile' | 'tablet' | 'desktop';
  browser_info: any;
  services: any;
  total_price: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  barber_id: string;
  branch_id: string;
  updated_at: string;
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

export interface ServiceAnalytics {
  serviceName: string;
  viewCount: number;
  conversionRate: number;
  averageViewDuration: number;
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

export const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];

export interface UserJourney {
  entryPoint: string;
  pathSteps: PathStep[];
  completionStatus: 'completed' | 'abandoned';
  duration: number;
  userAgent: string;
  timestamp: string;
}

export interface PathStep {
  page: string;
  timeSpent: number;
  interactions: UserInteraction[];
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'view';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserBehaviorMetrics {
  averageSessionDuration: number;
  bounceRate: number;
  completionRate: number;
  commonPaths: PathAnalysis[];
  dropOffPoints: DropOffPoint[];
}

export interface PathAnalysis {
  path: string[];
  frequency: number;
  averageDuration: number;
  successRate: number;
}

export interface DropOffPoint {
  page: string;
  exitRate: number;
  averageTimeBeforeExit: number;
  previousPages: string[];
}
