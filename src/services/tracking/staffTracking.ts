
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './utils';
import type { BarberSelectionEvent } from './types';

export const trackBarberInteraction = async (event: BarberSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('barber_selection_events').insert({
      ...event,
      ...createTrackingEvent('barber_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking barber interaction:', error);
  }
};
