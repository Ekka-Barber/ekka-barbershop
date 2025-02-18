
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type InteractionType = 
  | 'page_view'
  | 'calendar_open'
  | 'calendar_close'
  | 'date_select'
  | 'time_select'
  | 'time_slot_view'
  | 'barber_select'
  | 'dialog_open'
  | 'dialog_close'
  | 'service_select'
  | 'branch_select'
  | 'menu_view'
  | 'offer_view'
  | 'button_click'
  | 'form_interaction'
  | 'pdf_view'
  | 'language_switch'
  | 'category_select'
  | 'calendar_interaction'
  | 'profile_interaction'
  | 'location_interaction'
  | 'location_view'
  | 'menu_open'
  | 'menu_close'
  | 'page_change'
  | 'zoom'
  | 'profile_view'
  | 'selection'
  | 'category_view'
  | 'category_view_end'
  | 'service_selection_update'
  | 'service_view'
  | 'service_selection'
  | 'service_selection_complete'
  | 'session_end'
  | 'offer_view_start'
  | 'offer_view_end'
  | 'marketing_funnel';

export interface BaseInteractionType {
  interaction_type: InteractionType;
  session_id?: string;
  device_type?: DeviceType;
  timestamp?: string;
  interaction_details?: Record<string, any>;
  source_page?: string;
}
