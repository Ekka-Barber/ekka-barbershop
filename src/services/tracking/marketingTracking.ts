
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType } from './utils';
import type { MarketingFunnelEvent } from './types';

export const trackMarketingFunnel = async (event: MarketingFunnelEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('marketing_funnel_events').insert({
      funnel_stage: event.funnel_stage,
      interaction_type: 'marketing_funnel',
      time_in_stage: event.time_in_stage,
      conversion_successful: event.conversion_successful,
      drop_off_point: event.drop_off_point,
      entry_point: event.entry_point,
      previous_stage: event.previous_stage,
      interaction_path: event.interaction_path,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking marketing funnel:', error);
  }
};
