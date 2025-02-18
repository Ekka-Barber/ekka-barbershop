
import { supabase } from "@/integrations/supabase/client";
import { BarberSelectionEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackBarberInteraction = async (event: BarberSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('barber_selection_events').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking barber interaction:', error);
    }
  });
};
