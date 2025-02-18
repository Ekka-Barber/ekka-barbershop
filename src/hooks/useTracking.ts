
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  initializeTracking, 
  cleanupTracking, 
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

  const safeInitialize = useCallback(async () => {
    try {
      await initializeTracking();
    } catch (error) {
      console.error('Error in tracking initialization:', error);
    }
  }, []);

  const safeTrackPageView = useCallback(async (path: string) => {
    try {
      await trackPageView(path);
    } catch (error) {
      console.error('Error in page view tracking:', error);
    }
  }, []);

  useEffect(() => {
    // Only initialize if we're not in a preview environment
    if (!window.location.hostname.includes('preview--')) {
      safeInitialize();
      return () => {
        try {
          cleanupTracking();
        } catch (error) {
          console.error('Error in tracking cleanup:', error);
        }
      };
    }
  }, [safeInitialize]);

  useEffect(() => {
    // Only track page views if we're not in a preview environment
    if (!window.location.hostname.includes('preview--')) {
      safeTrackPageView(location.pathname);
    }
  }, [location, safeTrackPageView]);

  // Wrap all tracking functions in try-catch for resilience
  const safeTrackInteraction = useCallback(async (...args: Parameters<typeof trackInteraction>) => {
    try {
      await trackInteraction(...args);
    } catch (error) {
      console.error('Error in interaction tracking:', error);
    }
  }, []);

  const safeTrackServiceInteraction = useCallback(async (...args: Parameters<typeof trackServiceInteraction>) => {
    try {
      await trackServiceInteraction(...args);
    } catch (error) {
      console.error('Error in service interaction tracking:', error);
    }
  }, []);

  const safeTrackDateTimeInteraction = useCallback(async (...args: Parameters<typeof trackDateTimeInteraction>) => {
    try {
      await trackDateTimeInteraction(...args);
    } catch (error) {
      console.error('Error in date/time interaction tracking:', error);
    }
  }, []);

  const safeTrackBarberInteraction = useCallback(async (...args: Parameters<typeof trackBarberInteraction>) => {
    try {
      await trackBarberInteraction(...args);
    } catch (error) {
      console.error('Error in barber interaction tracking:', error);
    }
  }, []);

  const safeTrackOfferInteraction = useCallback(async (...args: Parameters<typeof trackOfferInteraction>) => {
    try {
      await trackOfferInteraction(...args);
    } catch (error) {
      console.error('Error in offer interaction tracking:', error);
    }
  }, []);

  const safeTrackMarketingFunnel = useCallback(async (...args: Parameters<typeof trackMarketingFunnel>) => {
    try {
      await trackMarketingFunnel(...args);
    } catch (error) {
      console.error('Error in marketing funnel tracking:', error);
    }
  }, []);

  return {
    trackInteraction: safeTrackInteraction,
    trackServiceInteraction: safeTrackServiceInteraction,
    trackDateTimeInteraction: safeTrackDateTimeInteraction,
    trackBarberInteraction: safeTrackBarberInteraction,
    trackOfferInteraction: safeTrackOfferInteraction,
    trackMarketingFunnel: safeTrackMarketingFunnel
  };
};
