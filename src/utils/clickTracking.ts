
import { supabase } from "@/integrations/supabase/client";

// Detect device type
const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// Track click events
export const trackClick = async (event: MouseEvent) => {
  try {
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.round(event.clientX);
    const y = Math.round(event.clientY);

    await supabase.from('click_tracking').insert([{
      x_coordinate: x,
      y_coordinate: y,
      page_url: window.location.pathname,
      element_id: target.id || null,
      element_class: target.className || null,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      device_type: getDeviceType()
    }]);
  } catch (error) {
    console.error('Error tracking click:', error);
  }
};
