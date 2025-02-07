
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
    const x = Math.round(event.clientX);
    const y = Math.round(event.clientY);
    const pageUrl = window.location.pathname;

    console.log('Tracking click:', {
      x,
      y,
      pageUrl,
      deviceType: getDeviceType()
    });

    const { error } = await supabase.from('click_tracking').insert([{
      x_coordinate: x,
      y_coordinate: y,
      page_url: pageUrl,
      element_id: target.id || null,
      element_class: target.className || null,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      device_type: getDeviceType()
    }]);

    if (error) {
      console.error('Error tracking click:', error);
      toast.error('Error tracking click');
    }

  } catch (error) {
    console.error('Error tracking click:', error);
    toast.error('Error tracking click');
  }
};
