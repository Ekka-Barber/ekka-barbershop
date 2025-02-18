
import { supabase } from "@/integrations/supabase/client";
import { OfferInteractionEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackOfferInteraction = async (event: Partial<OfferInteractionEvent>): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('offer_interactions').insert({
      ...event,
      interaction_type: event.interaction_type || 'view', // Ensure interaction_type is never undefined
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking offer interaction:', error);
    }
  });
};
