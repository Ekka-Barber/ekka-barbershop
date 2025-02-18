
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType } from './utils';
import type { DateTimeEvent } from './types';

export const trackDateTimeInteraction = async (event: DateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('datetime_tracking').insert({
      interaction_type: event.interaction_type,
      calendar_view_type: event.calendar_view_type,
      days_in_advance: event.days_in_advance,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      selected_date: event.selected_date,
      selected_time: event.selected_time,
      view_duration_seconds: event.view_duration_seconds,
      calendar_navigation_path: event.calendar_navigation_path,
      preferred_time_slots: event.preferred_time_slots,
      browser_info: event.interaction_details,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking datetime interaction:', error);
  }
};
