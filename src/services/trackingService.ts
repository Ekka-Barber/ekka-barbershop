
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType } from "@/services/platformDetection";
import type { 
  BarberSelectionEvent, 
  ServiceDiscoveryEvent,
  DateTimeEvent,
  OfferInteractionEvent,
  MarketingFunnelEvent,
  BranchSelectionEvent
} from './tracking/types';

// Session management
let currentSession: string | null = null;
let lastActivity: number = Date.now();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const getSessionId = (): string => {
  if (!currentSession) {
    currentSession = Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
  lastActivity = Date.now();
  return currentSession;
};

const shouldTrack = (): boolean => {
  if (Date.now() - lastActivity > SESSION_TIMEOUT) {
    currentSession = null;
  }
  return !window.location.hostname.includes('preview--');
};

// Utility functions
const mapPlatformToDeviceType = (platform: string): 'mobile' | 'tablet' | 'desktop' => {
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    default:
      return 'desktop';
  }
};

// Core tracking functions
export const trackPageView = async (path: string): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    const { error } = await supabase.from('page_views').insert({
      page_url: path,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

export const trackInteraction = async (
  type: string,
  details: Record<string, any> = {}
): Promise<void> => {
  if (!shouldTrack()) return;

  try {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: type,
      interaction_details: details,
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      page_url: window.location.pathname,
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
      session_id: getSessionId(),
      device_type: mapPlatformToDeviceType(getPlatformType()),
      created_at: new Date().toISOString()
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
  currentSession = null;
};
