
export interface CampaignMetrics {
  visits: number;
  uniqueVisitors: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  costs: number;
  roas: number;
  cpl: number;
  cac: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export interface TimelineDataPoint {
  date: string;
  visits: number;
  tiktok_visits: number;
  conversions: number;
  deviceBreakdown: DeviceMetrics;
  costs?: number;
  revenue?: number;
  bounceRate?: number;
  avgSessionDuration?: number;
}

export interface DeviceMetrics {
  mobile: number;
  desktop: number;
  tablet: number;
}

export interface TrafficSource {
  name: string;
  value: number;
  percent: number;
  color: string;
}

export interface SummaryMetrics {
  total_visits: number;
  total_conversions: number;
  overall_conversion_rate: string;
  tiktok_visits: number;
  tiktok_conversions: number;
  tiktok_conversion_rate: string;
  tiktok_percentage: string;
  metrics: CampaignMetrics;
}

export interface AggregatedMetrics {
  day: string;
  utm_source: string | null;
  visits: number;
  unique_visitors: number;
  conversions: number;
  cost: number;
  revenue: number;
  avg_session_duration: number;
  bounce_rate: number;
}
