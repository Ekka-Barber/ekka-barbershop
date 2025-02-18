
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { getPlatformType } from "@/services/platformDetection";

// Session management
let sessionId: string | null = null;

const getSessionId = (): string => {
  if (!sessionId) {
    // Try to get from localStorage first
    sessionId = localStorage.getItem('tracking_session_id');
    if (!sessionId) {
      // Generate new session ID if none exists
      sessionId = uuidv4();
      localStorage.setItem('tracking_session_id', sessionId);
    }
  }
  return sessionId;
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

// Page view tracking
export const trackPageView = async (path: string) => {
  try {
    const { error } = await supabase.from('page_views').insert({
      path,
      session_id: getSessionId(),
      browser_info: getBrowserInfo(),
      device_type: getPlatformType(),
      referrer: document.referrer || null,
    });

    if (error) {
      console.error('Error tracking page view:', error);
    }
  } catch (error) {
    console.error('Error in trackPageView:', error);
  }
};

// Interaction tracking
export const trackInteraction = async (
  interactionType: string,
  details: Record<string, any>
) => {
  try {
    const { error } = await supabase.from('interaction_events').insert({
      interaction_type: interactionType,
      details,
      session_id: getSessionId(),
      device_type: getPlatformType(),
    });

    if (error) {
      console.error('Error tracking interaction:', error);
    }
  } catch (error) {
    console.error('Error in trackInteraction:', error);
  }
};

// Enhanced click tracking (building on existing implementation)
export const enhancedTrackClick = async (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const interactionDetails = {
    elementType: target.tagName.toLowerCase(),
    elementId: target.id || null,
    elementClass: target.className || null,
    path: window.location.pathname,
    x: event.clientX,
    y: event.clientY,
    timestamp: new Date().toISOString(),
  };

  await trackInteraction('click', interactionDetails);
};

// Initialize tracking
export const initializeTracking = () => {
  // Initialize session
  getSessionId();
  
  // Track initial page view
  trackPageView(window.location.pathname);
  
  // Setup global click tracking
  document.addEventListener('click', enhancedTrackClick);
};

// Cleanup tracking
export const cleanupTracking = () => {
  document.removeEventListener('click', enhancedTrackClick);
};
