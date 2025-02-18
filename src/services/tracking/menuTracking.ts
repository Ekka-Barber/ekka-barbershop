
import { supabase } from "@/integrations/supabase/client";
import { MenuInteractionEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackMenuInteraction = async (event: MenuInteractionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('menu_interactions').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking menu interaction:', error);
    }
  });
};
