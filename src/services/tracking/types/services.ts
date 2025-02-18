
import { BaseInteractionType } from './base';

export interface ServiceDiscoveryEvent extends BaseInteractionType {
  category_id?: string;
  service_id?: string;
  selected_service_name?: string;
  discovery_path?: string[];
  description_viewed?: boolean;
  price_viewed?: boolean;
  view_duration_seconds?: number;
}

export interface ServiceTracking {
  service_name: string;
  action: 'added' | 'removed';
  timestamp: string;
}

export interface ServiceAnalytics {
  serviceName: string;
  viewCount: number;
  conversionRate: number;
  averageViewDuration: number;
}

export interface ServiceStats {
  name: string;
  added: number;
  removed: number;
  net: number;
}
