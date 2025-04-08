
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Check if we're on production
const isProduction = (): boolean => {
  return window.location.hostname === 'ekka-barbershop.lovable.app';
};

// Track social media clicks
export const trackSocialClick = async (platform: string, url: string) => {
  // Check if we're in production before tracking
  if (!isProduction()) {
    console.log(`[DEV] Social media click tracked: ${platform} - ${url}`);
    return;
  }

  try {
    // Log only the attempt to track, without trying to insert into non-existent table
    console.log(`Tracking social click: ${platform} - ${url}`);
    
    // Alternative approach: Track social interactions via TikTok tracking
    // This functionality is handled in the component itself
  } catch (err) {
    console.error('Error tracking social media click:', err);
  }
};

// Click tracking functionality is currently disabled
export const trackClick = async (event: MouseEvent) => {
  // Tracking disabled
  return;
};
