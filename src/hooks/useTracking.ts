
import { useCallback } from 'react';
import { unifiedTracking } from '@/services/tracking/unifiedTracking';
import type { 
  ServiceInteractionEvent,
  BarberInteractionEvent,
  DateTimeInteractionEvent,
  OfferInteractionEvent,
  MenuInteractionEvent,
  BranchSelectionEvent,
  MarketingFunnelEvent
} from '@/services/tracking/types/unified';

export const useTracking = () => {
  const trackPageView = useCallback((url: string, additionalData = {}) => {
    unifiedTracking.trackPageView(url, additionalData);
  }, []);

  const trackInteraction = useCallback((type: string, details = {}) => {
    unifiedTracking.trackInteraction(type, details);
  }, []);

  const trackServiceInteraction = useCallback((event: Omit<ServiceInteractionEvent, 'event_type'>) => {
    unifiedTracking.trackServiceInteraction(event);
  }, []);

  const trackBarberInteraction = useCallback((event: Omit<BarberInteractionEvent, 'event_type'>) => {
    unifiedTracking.trackBarberInteraction(event);
  }, []);

  const trackDateTimeInteraction = useCallback((event: Omit<DateTimeInteractionEvent, 'event_type'>) => {
    unifiedTracking.trackDateTimeInteraction(event);
  }, []);

  const trackOfferInteraction = useCallback((event: Omit<OfferInteractionEvent, 'event_type'>) => {
    unifiedTracking.trackOfferInteraction(event);
  }, []);

  const trackMenuInteraction = useCallback((event: Omit<MenuInteractionEvent, 'event_type'>) => {
    unifiedTracking.trackMenuInteraction(event);
  }, []);

  const trackBranchSelection = useCallback((event: Omit<BranchSelectionEvent, 'event_type'>) => {
    unifiedTracking.trackBranchSelection(event);
  }, []);

  const trackMarketingFunnel = useCallback((event: MarketingFunnelEvent) => {
    unifiedTracking.trackMarketingFunnel(event);
  }, []);

  return {
    trackPageView,
    trackInteraction,
    trackServiceInteraction,
    trackBarberInteraction,
    trackDateTimeInteraction,
    trackOfferInteraction,
    trackMenuInteraction,
    trackBranchSelection,
    trackMarketingFunnel
  };
};
