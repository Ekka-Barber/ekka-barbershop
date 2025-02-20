
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

// Track initial visit
export const trackCampaignVisit = async () => {
  // Skip tracking for development/preview domains
  if (shouldExcludeTracking()) {
    console.log('Skipping campaign tracking for development/preview domain');
    return null;
  }

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
    return data.id;
  } catch (error) {
    console.error('Error tracking campaign visit:', error);
    return null;
  }
};

// Update visit when booking is made
export const updateCampaignConversion = async (visitId: string | null, bookingId: string) => {
  if (!visitId) return;

  try {
    const { error } = await supabase
      .from('campaign_visits')
      .update({
        converted_to_booking: true,
        conversion_date: new Date().toISOString(),
        booking_id: bookingId
      })
      .eq('id', visitId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating campaign conversion:', error);
  }
};
