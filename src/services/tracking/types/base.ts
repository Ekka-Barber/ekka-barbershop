
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
  | 'marketing_funnel';  // Added this type

export interface BaseInteractionType {
  interaction_type: InteractionType;
  session_id?: string;
  device_type?: DeviceType;
  timestamp?: string;
  interaction_details?: Record<string, any>;
  source_page?: string;
}
