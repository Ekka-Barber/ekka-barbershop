
import { supabase } from "@/integrations/supabase/client";
import { ServiceDiscoveryEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackServiceInteraction = async (event: ServiceDiscoveryEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('service_discovery_events').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking service interaction:', error);
    }
  });
};
