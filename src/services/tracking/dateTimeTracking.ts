
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
      ...event,
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
