
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  initializeTracking, 
  cleanupTracking, 
  trackPageView, 
  trackInteraction 
} from '@/services/trackingService';

export const useTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize tracking when the hook is first used
    initializeTracking();

    // Cleanup on unmount
    return () => {
      cleanupTracking();
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return {
    trackInteraction,
  };
};
