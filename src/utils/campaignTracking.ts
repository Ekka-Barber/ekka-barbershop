
import { supabase } from "@/integrations/supabase/client";

// List of domains to exclude from tracking
const EXCLUDED_DOMAINS = [
  'preview--ekka-barbershop.lovable.app',
  'lovable.dev',
  'localhost',
  '127.0.0.1'
];

// Check if current domain should be excluded from tracking
const shouldExcludeTracking = (): boolean => {
  try {
    const hostname = window.location.hostname;
    return EXCLUDED_DOMAINS.some(domain => hostname.includes(domain));
  } catch (error) {
    console.error('Error checking domain:', error);
    return true; // Exclude tracking if there's an error
  }
};

// Get UTM parameters from URL
const getUTMParameters = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_campaign_id: urlParams.get('utm_campaign_id')
  };
};

// Detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Session start timestamp for duration calculation
let sessionStartTime: Date | null = null;

// Track initial visit
export const trackCampaignVisit = async () => {
  // Skip tracking for development/preview domains
  if (shouldExcludeTracking()) {
    console.log('Skipping campaign tracking for development/preview domain');
    return null;
  }

  // Set session start time
  sessionStartTime = new Date();

  const utmParams = getUTMParameters();
  
  try {
    const { data, error } = await supabase
      .from('campaign_visits')
      .insert({
        ...utmParams,
        page_url: window.location.pathname,
        referrer: document.referrer,
        device_type: getDeviceType(),
        browser_info: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${window.screen.width}x${window.screen.height}`
        }
      })
      .select()
      .single();

    if (error) throw error;
    
    // Store visit ID in localStorage
    if (data?.id) {
      localStorage.setItem('campaign_visit_id', data.id);
      
      // Set up bounce detection
      setupBounceDetection(data.id);
    }
    
    return data.id;
  } catch (error) {
    console.error('Error tracking campaign visit:', error);
    return null;
  }
};

// Setup bounce detection
const setupBounceDetection = (visitId: string) => {
  // Track page navigation and interactions
  let hasInteracted = false;
  const interactionEvents = ['click', 'scroll', 'keypress'];
  
  // Track user interactions
  const handleInteraction = () => {
    hasInteracted = true;
    // Remove event listeners once interaction is detected
    interactionEvents.forEach(event => 
      document.removeEventListener(event, handleInteraction)
    );
  };
  
  // Add event listeners for interactions
  interactionEvents.forEach(event => 
    document.addEventListener(event, handleInteraction)
  );
  
  // Update bounce status when user leaves page
  window.addEventListener('beforeunload', async () => {
    const isBounce = !hasInteracted;
    let sessionDuration = null;
    
    if (sessionStartTime) {
      const endTime = new Date();
      sessionDuration = (endTime.getTime() - sessionStartTime.getTime()) / 1000; // in seconds
    }
    
    // Only update if we have a valid visitId
    if (visitId) {
      try {
        await supabase
          .from('campaign_visits')
          .update({
            bounce: isBounce,
            session_duration: sessionDuration ? `${Math.floor(sessionDuration)} seconds` : null
          })
          .eq('id', visitId);
      } catch (error) {
        console.error('Error updating bounce status:', error);
      }
    }
  });
};

// Update visit when booking is made
export const updateCampaignConversion = async (visitId: string | null, bookingId: string) => {
  if (!visitId) return;

  try {
    // Get booking details for revenue calculation
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('total_price')
      .eq('id', bookingId)
      .single();
      
    if (bookingError) throw bookingError;
    
    const revenue = bookingData?.total_price || 0;

    const { error } = await supabase
      .from('campaign_visits')
      .update({
        converted_to_booking: true,
        conversion_date: new Date().toISOString(),
        booking_id: bookingId,
        revenue: revenue
      })
      .eq('id', visitId);

    if (error) throw error;
    
    // Refresh the materialized view
    await supabase.rpc('refresh_campaign_metrics');
  } catch (error) {
    console.error('Error updating campaign conversion:', error);
  }
};
