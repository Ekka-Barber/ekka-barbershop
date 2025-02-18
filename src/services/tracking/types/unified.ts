
import { DeviceType, InteractionType } from './base';

export type UnifiedEventType = 'page_view' | 'interaction' | 'business' | 'analytics';

export interface UnifiedEvent {
  event_type: UnifiedEventType;
  event_name: string;
  session_id?: string;
  user_id?: string;
  device_type?: DeviceType;
  page_url?: string;
  event_data?: Record<string, any>;
}

export interface TrackingSession {
  id: string;
  user_id?: string;
  device_type?: DeviceType;
  start_time: Date;
  end_time?: Date;
  session_data?: Record<string, any>;
}

export interface FunnelStage {
  session_id: string;
  stage_name: string;
  entry_time: Date;
  exit_time?: Date;
  conversion_successful: boolean;
  stage_data?: Record<string, any>;
}
