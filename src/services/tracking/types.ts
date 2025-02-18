
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type BaseInteractionType = 'page_view' | 'button_click' | 'dialog_open' | 'dialog_close' | 
                                 'form_interaction' | 'pdf_view' | 'menu_view' | 'offer_view' | 
                                 'branch_select' | 'service_select' | 'barber_select' | 'language_switch';

export type ServiceInteractionType = 'category_view' | 'service_view' | 'service_compare';
export type DateTimeInteractionType = 'calendar_open' | 'calendar_close' | 'date_select' | 'time_select' | 'time_slot_view';
export type BarberInteractionType = 'profile_view' | 'availability_check' | 'selection' | 'comparison';

export interface SessionData {
  id: string;
  timestamp: number;
}

export interface ServiceDiscoveryEvent {
  category_id: string;
  service_id?: string;
  interaction_type: ServiceInteractionType;
  discovery_path: string[];
  selected_service_name?: string;
  price_viewed: boolean;
  description_viewed: boolean;
  session_id: string;
  device_type: DeviceType;
  timestamp: string;
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
