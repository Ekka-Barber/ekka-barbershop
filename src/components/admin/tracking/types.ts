
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
  services: any; // Changed from any[] to any to match JSON
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
  index?: number; // Added for Sankey diagram
}

export interface JourneyLink {
  source: number; // Changed from string to number for Sankey diagram
  target: number; // Changed from string to number for Sankey diagram
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
