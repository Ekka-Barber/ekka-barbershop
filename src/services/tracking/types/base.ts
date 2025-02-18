
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type InteractionType = 
  // Core interactions
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
  | 'marketing_funnel'
  // Menu interactions
  | 'menu_open'
  | 'menu_close'
  | 'page_change'
  | 'zoom'
  // Barber interactions
  | 'profile_view'
  | 'selection'
  // Service interactions
  | 'service_view'
  | 'service_selection'
  // Offer interactions
  | 'offer_view_start'
  | 'offer_view_end'
  | 'session_end';

export interface BaseInteractionType {
  interaction_type: InteractionType;
  session_id?: string;
  device_type?: DeviceType;
  timestamp?: string;
  interaction_details?: Record<string, any>;
  source_page?: string;
}
