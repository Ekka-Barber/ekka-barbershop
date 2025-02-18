
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
type DateTimeInteractionType = 'calendar_open' | 'calendar_close' | 'date_select' | 'time_select' | 'time_slot_view';

type InteractionType = BaseInteractionType | ServiceInteractionType;

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

interface DateTimeInteractionEvent {
  session_id: string;
  interaction_type: DateTimeInteractionType;
  selected_date?: string;
  selected_time?: string;
  calendar_view_type: 'month' | 'week' | 'quick_select';
  time_slot_position?: string;
  device_type: DeviceType;
  browser_info?: any;
}

interface SessionData {
  id: string;
  timestamp: number;
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

// Page view tracking
export const trackPageView = async (pageUrl: string): Promise<void> => {
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

// Interaction tracking
export const trackInteraction = async (
  type: InteractionType,
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

// Service interaction tracking
export const trackServiceInteraction = async (event: ServiceDiscoveryEvent): Promise<void> => {
  if (!shouldTrack()) return;

  const session = getSessionId();
  if (!session) return;

  await tryTracking(async () => {
    const { error } = await supabase.from('service_discovery').insert({
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

// DateTime interaction tracking
export const trackDateTimeInteraction = async (event: DateTimeInteractionEvent): Promise<void> => {
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

// Initialize tracking
export const initializeTracking = (): void => {
  if (!shouldTrack()) return;
  getSessionId();
  trackPageView(window.location.pathname);
};

// Cleanup tracking
export const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
};

// Export other functions
export { trackPageView, trackInteraction, trackServiceInteraction };
