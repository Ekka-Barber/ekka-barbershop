
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType } from './utils';
import type { InteractionType } from './types';
import type { Json } from '@/integrations/supabase/types';

export const trackInteraction = async (
  type: Extract<InteractionType, 
    | 'page_view' 
    | 'barber_select' 
    | 'dialog_open' 
    | 'dialog_close' 
    | 'service_select' 
    | 'branch_select' 
    | 'menu_view' 
    | 'offer_view' 
    | 'button_click' 
    | 'form_interaction' 
    | 'pdf_view' 
    | 'language_switch'>,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: type,
      interaction_details: details as Json,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      page_url: window.location.pathname,
      element_class: details.element_class,
      element_id: details.element_id,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};
