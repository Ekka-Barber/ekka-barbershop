
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './utils';
import type { OfferInteractionEvent } from './types';

export const trackOfferInteraction = async (event: OfferInteractionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('offer_interactions').insert({
      ...event,
      ...createTrackingEvent(event.interaction_type),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking offer interaction:', error);
  }
};
