
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
    const doc = target.ownerDocument;
    
    // Get scroll position
    const scrollX = doc.defaultView?.scrollX || doc.documentElement.scrollLeft || 0;
    const scrollY = doc.defaultView?.scrollY || doc.documentElement.scrollTop || 0;
    
    // Get total content size (ensure non-zero values)
    const contentWidth = Math.max(
      doc.documentElement.scrollWidth,
      doc.documentElement.clientWidth,
      doc.documentElement.offsetWidth,
      100 // Minimum width to prevent division by zero
    );
    const contentHeight = Math.max(
      doc.documentElement.scrollHeight,
      doc.documentElement.clientHeight,
      doc.documentElement.offsetHeight,
      100 // Minimum height to prevent division by zero
    );

    // Get click coordinates relative to the document
    const rect = target.getBoundingClientRect();
    const x = Math.round(event.clientX + scrollX);
    const y = Math.round(event.clientY + scrollY);
    
    const pageUrl = doc.location.pathname;

    console.log('Tracking click:', {
      x,
      y,
      scrollX,
      scrollY,
      contentWidth,
      contentHeight,
      pageUrl,
      deviceType: getDeviceType()
    });

    const { error } = await supabase.from('click_tracking').insert([{
      x_coordinate: x,
      y_coordinate: y,
      scroll_x: scrollX,
      scroll_y: scrollY,
      content_width: contentWidth,
      content_height: contentHeight,
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
