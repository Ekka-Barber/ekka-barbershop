import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { 
  ServiceDiscoveryEvent, 
  DateTimeEvent, 
  BarberSelectionEvent,
  BaseInteractionType,
  OfferInteractionEvent,
  MarketingFunnelEvent
} from './tracking/types';
import { getSessionId, shouldTrack } from './tracking/sessionManager';
import { mapPlatformToDeviceType, getBrowserInfo, tryTracking } from './tracking/utils';

const trackPageView = async (pageUrl: string): Promise<void> => {
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

const trackInteraction = async (
  type: BaseInteractionType,
  details: Record<string, any>
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

const trackServiceInteraction = async (event: ServiceDiscoveryEvent): Promise<void> => {
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

const trackDateTimeInteraction = async (event: DateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('datetime_tracking').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      browser_info: getBrowserInfo(),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking datetime interaction:', error);
    }
  });
};

const trackBarberInteraction = async (event: BarberSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('barber_selection_events').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      timestamp: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking barber interaction:', error);
    }
  });
};

const trackOfferInteraction = async (event: OfferInteractionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('offer_interactions').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking offer interaction:', error);
    }
  });
};

const trackMarketingFunnel = async (event: MarketingFunnelEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('marketing_funnel_events').insert({
      ...event,
      session_id: session,
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error tracking marketing funnel event:', error);
    }
  });
};

const initializeTracking = (): void => {
  if (!shouldTrack()) return;
  getSessionId();
  trackPageView(window.location.pathname);
  // Track initial marketing funnel stage
  trackMarketingFunnel({
    funnel_stage: 'landing',
    time_in_stage: 0,
    conversion_successful: false,
    drop_off_point: false,
    entry_point: window.location.pathname,
    interaction_path: {
      path: [window.location.pathname],
      timestamps: [Date.now()]
    }
  });
};

const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
};

export {
  trackPageView,
  trackInteraction,
  trackServiceInteraction,
  trackDateTimeInteraction,
  trackBarberInteraction,
  trackOfferInteraction,
  trackMarketingFunnel,
  initializeTracking,
  cleanupTracking
};
