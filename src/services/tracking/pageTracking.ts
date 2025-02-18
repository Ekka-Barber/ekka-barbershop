
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, getBrowserInfo, tryTracking } from './utils';

export type PageInteractionType = 
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
  | 'language_switch';

// Temporary solution to handle location_view
type ExtendedInteractionType = PageInteractionType | 'location_view';

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
  type: ExtendedInteractionType,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  // Map location_view to page_view for database compatibility
  const dbInteractionType = type === 'location_view' ? 'page_view' : type;

  await tryTracking(async () => {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: dbInteractionType,
      interaction_details: { ...details, original_type: type },
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
