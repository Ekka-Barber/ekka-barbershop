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

// Click tracking functionality is currently disabled
export const trackClick = async (event: MouseEvent) => {
  // Tracking disabled
  return;
};
