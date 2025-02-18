
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './utils';
import type { ServiceDiscoveryEvent } from './types';

export const trackServiceInteraction = async (event: ServiceDiscoveryEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('service_discovery_events').insert({
      ...event,
      ...createTrackingEvent('service_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking service interaction:', error);
  }
};
