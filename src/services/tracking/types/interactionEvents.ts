
import { DeviceType, InteractionType } from './base';

export interface TrackingEvent {
  session_id: string;
  device_type: DeviceType;
  created_at: string;
  interaction_type: InteractionType;
  source_page?: string;
}

export interface PageViewEvent extends TrackingEvent {
  page_url: string;
}

export interface InteractionEvent extends TrackingEvent {
  interaction_details?: Record<string, any>;
  page_url: string;
}
