
import { DeviceType, InteractionType } from './base';

// Core event types
export type UnifiedEventType = 
  | 'page_view' 
  | 'interaction' 
  | 'business' 
  | 'marketing' 
  | 'analytics';

// Base event interface
export interface UnifiedEvent {
  event_type: UnifiedEventType;
  event_name: string;
  session_id?: string;
  user_id?: string;
  device_type?: DeviceType;
  page_url?: string;
  event_data?: Record<string, any>;
  timestamp?: string;
}

// Session tracking
export interface TrackingSession {
  id: string;
  user_id?: string;
  device_type?: DeviceType;
  start_time: string;
  end_time?: string;
  last_activity?: string;
  session_data?: Record<string, any>;
}

// Marketing funnel
export interface MarketingFunnelEvent {
  session_id: string;
  funnel_stage: string;
  entry_time: string;
  exit_time?: string;
  conversion_successful: boolean;
  drop_off_point: boolean;
  entry_point: string;
  previous_stage?: string;
  interaction_path: {
    path: string[];
    timestamps: number[];
  };
}

// Specific interaction types
export interface ServiceInteractionEvent extends UnifiedEvent {
  service_id?: string;
  category_id?: string;
  view_duration_seconds?: number;
  price_viewed?: boolean;
  description_viewed?: boolean;
  selected_service_name?: string;
}

export interface BarberInteractionEvent extends UnifiedEvent {
  barber_id: string;
  view_duration_seconds: number;
  availability_status: boolean;
  comparison_count?: number;
  time_to_selection_seconds?: number;
  selection_criteria?: {
    availability_based: boolean;
    nationality_based: boolean;
    time_slot_based: boolean;
  };
}

export interface DateTimeInteractionEvent extends UnifiedEvent {
  selected_date?: string;
  selected_time?: string;
  calendar_view_type?: 'month' | 'week' | 'quick_select';
  days_in_advance?: number;
  time_slot_position?: string;
  quick_select_usage?: boolean;
  view_duration_seconds?: number;
  calendar_navigation_path?: string[];
  preferred_time_slots?: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}

export interface OfferInteractionEvent extends UnifiedEvent {
  offer_id?: string;
  view_duration_seconds?: number;
  source_page?: string;
  interaction_details?: {
    scroll_depth?: number;
    zoom_actions?: number;
    total_interaction_time?: number;
  };
}

export interface MenuInteractionEvent extends UnifiedEvent {
  menu_file_id?: string;
  view_duration_seconds?: number;
  zoom_actions?: number;
  page_changes?: number;
}

export interface BranchSelectionEvent extends UnifiedEvent {
  branch_id?: string;
  dialog_open_time?: string;
  dialog_close_time?: string;
  selected_branch_name?: string;
  source_page: string;
}
