
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type ServiceInteractionType = 
  | 'category_view'
  | 'category_view_end'
  | 'service_view'
  | 'service_selection'
  | 'service_selection_update'
  | 'service_selection_complete';

export type DateTimeInteractionType = 
  | 'calendar_open' 
  | 'calendar_close' 
  | 'date_select' 
  | 'time_select' 
  | 'time_slot_view';

export type BarberInteractionType = 
  | 'profile_view' 
  | 'availability_check' 
  | 'selection' 
  | 'comparison';

export type BaseInteractionType = 
  | 'page_view' 
  | 'dialog_open' 
  | 'dialog_close' 
  | 'service_select'
  | 'branch_select'
  | 'location_view';

export type BranchInteractionType = 
  | 'dialog_open'
  | 'dialog_close'
  | 'branch_select'
  | 'location_view'
  | 'maps_redirect';

export interface ServiceDiscoveryEvent {
  category_id?: string;
  service_id?: string;
  interaction_type: ServiceInteractionType;
  discovery_path: string[];
  selected_service_name?: string;
  price_viewed: boolean;
  description_viewed: boolean;
  view_duration_seconds?: number;
  device_type?: DeviceType;
  timestamp?: string;
  session_id?: string;
}

export interface DateTimeEvent {
  interaction_type: DateTimeInteractionType;
  calendar_view_type: 'month' | 'week' | 'quick_select';
  session_id: string;
  device_type: DeviceType;
  selected_date?: string;
  selected_time?: string;
  time_slot_position?: string;
  view_duration_seconds?: number;
  calendar_navigation_path?: string[];
  days_in_advance?: number;
  preferred_time_slots?: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  quick_select_usage?: boolean;
}

export interface BarberSelectionEvent {
  barber_id: string;
  interaction_type: BarberInteractionType;
  view_duration_seconds: number;
  availability_status: boolean;
  time_to_selection_seconds?: number;
  comparison_count?: number;
  preferred_time_slots?: string[];
  selection_criteria?: {
    availability_based: boolean;
    nationality_based: boolean;
    time_slot_based: boolean;
  };
  session_id: string;
  device_type: DeviceType;
  timestamp: string;
}

export interface BranchSelectionEvent {
  branch_id?: string;
  selected_branch_name?: string;
  interaction_type: BranchInteractionType;
  source_page: string;
  dialog_open_time?: string;
  dialog_close_time?: string;
  device_type?: DeviceType;
  session_id?: string;
}

export interface SessionData {
  id: string;
  timestamp: number;
}

export interface OfferInteractionEvent {
  offer_id: string;
  interaction_type: string;
  view_duration_seconds: number;
  session_id: string;
  device_type: DeviceType;
  source_page: string;
  interaction_details?: {
    scroll_depth?: number;
    zoom_actions?: number;
    click_positions?: Array<{ x: number; y: number }>;
    total_interaction_time?: number;
  };
  conversion_info?: {
    converted: boolean;
    time_to_conversion?: number;
    conversion_path?: string[];
    conversion_type?: string;
  };
}

export type MarketingFunnelStage = 
  | 'landing'
  | 'offer_view'
  | 'service_browse'
  | 'service_select'
  | 'datetime_select'
  | 'barber_select'
  | 'booking_complete';

export interface MarketingFunnelEvent {
  session_id: string;
  device_type: DeviceType;
  funnel_stage: MarketingFunnelStage;
  previous_stage?: MarketingFunnelStage;
  time_in_stage: number;
  conversion_successful: boolean;
  drop_off_point: boolean;
  entry_point: string;
  exit_point?: string;
  interaction_path?: {
    path: string[];
    timestamps: number[];
  };
  metadata?: Record<string, any>;
}

export interface MenuInteractionEvent {
  menu_file_id?: string;
  interaction_type: 'page_view' | 'zoom' | 'page_change' | 'menu_open' | 'menu_close';
  view_duration_seconds?: number;
  page_changes?: number;
  zoom_actions?: number;
  session_id?: string;
  device_type?: DeviceType;
}
