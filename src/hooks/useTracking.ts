
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  initializeTracking, 
  cleanupTracking, 
  trackPageView, 
  trackInteraction,
  trackServiceInteraction 
} from '@/services/trackingService';

export const useTracking = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      initializeTracking();
      return () => {
        cleanupTracking();
      };
    } catch (error) {
      console.error('Error in tracking initialization:', error);
    }
  }, []);

  useEffect(() => {
    try {
      trackPageView(location.pathname);
    } catch (error) {
      console.error('Error in page view tracking:', error);
    }
  }, [location]);

  return {
    trackInteraction,
    trackServiceInteraction
  };
};
