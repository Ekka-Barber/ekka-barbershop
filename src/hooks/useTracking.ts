
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageView, 
  trackInteraction,
  trackServiceInteraction,
  trackDateTimeInteraction,
  trackBarberInteraction,
  trackOfferInteraction,
  trackMarketingFunnel
} from '@/services/trackingService';

export const useTracking = () => {
  const location = useLocation();
  const isInitialized = useRef(false);

  const safeTrackPageView = useCallback(async (path: string) => {
    if (!isInitialized.current) return;
    
    try {
      await trackPageView(path);
    } catch (error) {
      console.error('Error in page view tracking:', error);
    }
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      safeTrackPageView(location.pathname);
    }
  }, [location, safeTrackPageView]);

  return {
    trackInteraction,
    trackServiceInteraction,
    trackDateTimeInteraction,
    trackBarberInteraction,
    trackOfferInteraction,
    trackMarketingFunnel,
    trackPageView: safeTrackPageView
  };
};
