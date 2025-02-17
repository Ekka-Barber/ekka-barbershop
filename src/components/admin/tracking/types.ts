
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
  device_type: 'mobile' | 'desktop';
  browser_info: {
    userAgent: string;
    language: string;
  };
  services: any[];
  total_price: number;
  appointment_date: string;
  appointment_time: string;
  created_at: string;
}

export interface ServiceStats {
  name: string;
  added: number;
  removed: number;
  net: number;
}

export interface StepStats {
  name: string;
  count: number;
}

export const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#facc15'];
