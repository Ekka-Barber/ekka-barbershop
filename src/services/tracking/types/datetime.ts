
import { BaseInteractionType } from './base';

export interface DateTimeEvent extends BaseInteractionType {
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
