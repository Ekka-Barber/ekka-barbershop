
export interface ClickData {
  x_coordinate: number;
  y_coordinate: number;
  scroll_x: number;
  scroll_y: number;
  content_width: number;
  content_height: number;
  device_type: 'mobile' | 'tablet' | 'desktop';
  page_url: string;
  created_at: string;
}

export interface NormalizedClick {
  x: number;
  y: number;
  originalData: ClickData;
}

export interface Cluster {
  centerX: number;
  centerY: number;
  points: ClickData[];
}

export type DeviceType = 'all' | 'mobile' | 'tablet' | 'desktop';

export interface HeatmapColors {
  low: number[];
  medium: number[];
  high: number[];
  max: number[];
}
