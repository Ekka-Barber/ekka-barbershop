
import { supabase } from "@/integrations/supabase/client";
import { DateTimeEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, getBrowserInfo, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackDateTimeInteraction = async (event: DateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('datetime_tracking').insert({
      interaction_type: event.interaction_type,
      calendar_view_type: event.calendar_view_type,
      selected_date: event.selected_date,
      selected_time: event.selected_time,
      days_in_advance: event.days_in_advance,
      quick_select_usage: event.quick_select_usage,
      view_duration_seconds: event.view_duration_seconds,
      calendar_navigation_path: event.calendar_navigation_path,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      browser_info: getBrowserInfo(),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking datetime interaction:', error);
    }
  });
};
