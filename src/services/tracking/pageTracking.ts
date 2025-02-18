
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, getBrowserInfo, tryTracking } from './utils';

type InteractionEventType = 
  | 'page_view'
  | 'dialog_open'
  | 'dialog_close'
  | 'button_click'
  | 'form_interaction'
  | 'service_select'
  | 'menu_view'
  | 'offer_view'
  | 'branch_select'
  | 'barber_select'
  | 'pdf_view'
  | 'language_switch'
  | 'location_view';

export type PageInteractionType = InteractionEventType;

export const trackPageView = async (pageUrl: string): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('page_views').insert({
      page_url: pageUrl,
      session_id: session,
      browser_info: getBrowserInfo(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      entry_time: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking page view:', error);
    }
  });
};

export const trackInteraction = async (
  type: InteractionEventType,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: type,
      interaction_details: details,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      page_url: window.location.pathname,
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking interaction:', error);
    }
  });
};
