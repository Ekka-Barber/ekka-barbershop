
import { supabase } from "@/integrations/supabase/client";
import { MarketingFunnelEvent } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, tryTracking } from './utils';
import { getPlatformType } from "@/services/platformDetection";

export const trackMarketingFunnel = async (event: Partial<MarketingFunnelEvent>): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('audit_logs').insert({
      operation: 'marketing_funnel',
      table_name: 'marketing_funnel',
      details: JSON.stringify({
        ...event,
        session_id: session,
        device_type: mapPlatformToDeviceType(getPlatformType()),
        created_at: new Date().toISOString()
      })
    });

    if (error) {
      console.error('Error tracking marketing funnel event:', error);
    }
  });
};
