import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { getPlatformType } from "@/services/platformDetection";
import { Json } from "@/integrations/supabase/types";

// Types that match our database schema
type DeviceType = 'mobile' | 'tablet' | 'desktop';
type BaseInteractionType = 'page_view' | 'button_click' | 'dialog_open' | 'dialog_close' | 
                          'form_interaction' | 'pdf_view' | 'menu_view' | 'offer_view' | 
                          'branch_select' | 'service_select' | 'barber_select' | 'language_switch';

type ServiceInteractionType = 'category_view' | 'service_view' | 'service_compare';
type DateTimeInteractionType = 'calendar_open' | 'calendar_close' | 'date_select' | 'time_select' | 'time_slot_view' |
                              'calendar_navigation' | 'view_duration';
type BarberInteractionType = 'profile_view' | 'availability_check' | 'selection' | 'comparison';

interface ServiceDiscoveryEvent {
  category_id: string;
  service_id?: string;
  interaction_type: ServiceInteractionType;
  discovery_path: string[];
  selected_service_name?: string;
  price_viewed: boolean;
  description_viewed: boolean;
  session_id: string;
  device_type: DeviceType;
  timestamp: string;
}

interface EnhancedDateTimeEvent extends DateTimeInteractionEvent {
  view_duration_seconds?: number;
  calendar_navigation_path?: string[];
  days_in_advance?: number;
  preferred_time_slots?: {
    morning: number;
    afternoon: number;
    evening: number;
  };
  quick_select_usage?: boolean;
}

interface BarberSelectionEvent {
  barber_id: string;
  interaction_type: BarberInteractionType;
  view_duration_seconds: number;
  availability_status: boolean;
  time_to_selection_seconds?: number;
  comparison_count?: number;
  preferred_time_slots?: string[];
  selection_criteria?: {
    availability_based: boolean;
    nationality_based: boolean;
    time_slot_based: boolean;
  };
  session_id: string;
  device_type: DeviceType;
  timestamp: string;
}

// Production check
const shouldTrack = (): boolean => {
  return window.location.hostname === 'ekka-barbershop.lovable.app';
};

// Session management
let sessionId: string | null = null;

const getSessionId = (): string | null => {
  if (!shouldTrack()) return null;

  if (!sessionId) {
    const stored = localStorage.getItem('tracking_session_id');
    if (stored) {
      const sessionData: SessionData = JSON.parse(stored);
      if (Date.now() - sessionData.timestamp < 30 * 60 * 1000) { // 30 minutes
        sessionId = sessionData.id;
      }
    }
    
    if (!sessionId) {
      const newSession: SessionData = {
        id: uuidv4(),
        timestamp: Date.now()
      };
      localStorage.setItem('tracking_session_id', JSON.stringify(newSession));
      sessionId = newSession.id;
    }
  }
  return sessionId;
};

// Map platform to device type
const mapPlatformToDeviceType = (platform: ReturnType<typeof getPlatformType>): DeviceType => {
  switch (platform) {
    case 'ios':
    case 'android':
      return 'mobile';
    case 'desktop':
    default:
      return 'desktop';
  }
};

// Common tracking utilities
const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: getPlatformType(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };
};

// Error handling with retry logic
const tryTracking = async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      retries++;
      if (retries === maxRetries) {
        console.error('Tracking failed after max retries:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

const trackPageView = async (pageUrl: string): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  const deviceType = mapPlatformToDeviceType(getPlatformType());

  await tryTracking(async () => {
    const { error } = await supabase.from('page_views').insert({
      page_url: pageUrl,
      session_id: session,
      browser_info: getBrowserInfo(),
      device_type: deviceType,
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

  const deviceType = mapPlatformToDeviceType(getPlatformType());

  await tryTracking(async () => {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: type,
      interaction_details: details,
      session_id: session,
      device_type: deviceType,
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

const trackEnhancedDateTimeInteraction = async (event: EnhancedDateTimeEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const formattedDate = event.selected_date ? new Date(event.selected_date).toISOString().split('T')[0] : undefined;

    const { error } = await supabase.from('datetime_tracking').insert({
      ...event,
      selected_date: formattedDate,
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

const initializeTracking = (): void => {
  if (!shouldTrack()) return;
  getSessionId();
  trackPageView(window.location.pathname);
};

const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
};

// Export all tracking functions in a single export statement
export {
  trackPageView,
  trackInteraction,
  trackServiceInteraction,
  trackEnhancedDateTimeInteraction,
  trackBarberInteraction,
  initializeTracking,
  cleanupTracking
};
