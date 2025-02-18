
import { useCallback } from 'react';
import { unifiedTracking } from '@/services/tracking/unifiedTracking';
import type { FunnelStage } from '@/services/tracking/types/unified';

export const useTracking = () => {
  const trackPageView = useCallback((url: string, additionalData = {}) => {
    unifiedTracking.trackPageView(url, additionalData);
  }, []);

  const trackInteraction = useCallback((type: string, details = {}) => {
    unifiedTracking.trackInteraction(type, details);
  }, []);

  const trackBusinessEvent = useCallback((name: string, data = {}) => {
    unifiedTracking.trackBusinessEvent(name, data);
  }, []);

  const trackFunnelStage = useCallback((stage: FunnelStage) => {
    unifiedTracking.trackFunnelStage(stage);
  }, []);

  return {
    trackPageView,
    trackInteraction,
    trackBusinessEvent,
    trackFunnelStage
  };
};
