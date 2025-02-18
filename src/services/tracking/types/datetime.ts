
import { BaseInteractionType } from './base';

export type DateTimeInteractionType = 
  | 'calendar_open'
  | 'calendar_close'
  | 'date_select'
  | 'time_select'
  | 'time_slot_view';

export interface DateTimeEvent {
  interaction_type: DateTimeInteractionType;
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
  interaction_details?: Record<string, any>;
}
