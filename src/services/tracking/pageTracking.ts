
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { BaseInteractionType, DatabaseInteractionType } from './types';
import { getSessionId, shouldTrack } from './sessionManager';
import { mapPlatformToDeviceType, getBrowserInfo, tryTracking } from './utils';

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

const mapToValidDatabaseInteraction = (type: BaseInteractionType): DatabaseInteractionType => {
  // Map location_view to page_view as it's the closest equivalent
  if (type === 'location_view') {
    return 'page_view';
  }
  return type;
};

export const trackInteraction = async (
  type: BaseInteractionType,
  details: Record<string, any>
): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: mapToValidDatabaseInteraction(type),
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
