
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType } from './utils';

export const trackPageView = async (path: string): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    const { error } = await supabase.from('page_views').insert({
      page_url: path,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      entry_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};
