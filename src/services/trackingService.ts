
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import { getSessionId, shouldTrack } from './tracking/sessionManager';
import { mapPlatformToDeviceType, createTrackingEvent } from './tracking/utils';
import type { 
  BarberSelectionEvent, 
  ServiceDiscoveryEvent,
  DateTimeEvent,
  OfferInteractionEvent,
  MarketingFunnelEvent,
  BranchSelectionEvent,
  InteractionType
} from './tracking/types';

// Core tracking functions
export const trackPageView = async (path: string): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    const { error } = await supabase.from('page_views').insert({
      ...createTrackingEvent('page_view'),
      page_url: path,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackInteraction = async (
  type: InteractionType,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('interaction_events').insert({
      ...createTrackingEvent(type),
      interaction_details: details,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      page_url: window.location.pathname
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
};

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

export const trackDateTimeInteraction = async (event: DateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('datetime_tracking').insert({
      ...event,
      ...createTrackingEvent(event.interaction_type),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking datetime interaction:', error);
  }
};

export const trackOfferInteraction = async (event: OfferInteractionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('offer_interactions').insert({
      ...event,
      ...createTrackingEvent(event.interaction_type),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking offer interaction:', error);
  }
};

export const trackMarketingFunnel = async (event: MarketingFunnelEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('marketing_funnel_events').insert({
      ...event,
      ...createTrackingEvent('marketing_funnel'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking marketing funnel:', error);
  }
};

export const trackBranchSelection = async (event: BranchSelectionEvent): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('branch_selection_events').insert({
      ...event,
      ...createTrackingEvent('branch_select'),
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType())
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking branch selection:', error);
  }
};

export const initializeTracking = async (): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    await trackPageView(window.location.pathname);
    await trackMarketingFunnel({
      interaction_type: 'marketing_funnel',
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
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
};

export const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
  cleanupSession();
};
