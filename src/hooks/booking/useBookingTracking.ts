
import { useEffect, useRef } from 'react';
import { useTracking } from '@/hooks/useTracking';
import { BookingStep } from '@/components/booking/BookingProgress';
import { MarketingFunnelStage } from '@/services/tracking/types';

export const useBookingTracking = (
  currentStep: BookingStep,
  selectedServices: any[],
  selectedDate: Date | undefined,
  selectedBarber: string | undefined,
  customerDetails: { name: string }
) => {
  const { trackMarketingFunnel, trackInteraction } = useTracking();
  const stepStartTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const currentTime = Date.now();
    const timeInStage = Math.floor((currentTime - stepStartTimeRef.current) / 1000);

    const stepToFunnelStage: Record<BookingStep, MarketingFunnelStage> = {
      services: 'service_browse',
      datetime: 'datetime_select',
      barber: 'barber_select',
      details: 'booking_complete'
    };

    trackMarketingFunnel({
      interaction_type: 'marketing_funnel',
      funnel_stage: stepToFunnelStage[currentStep],
      time_in_stage: timeInStage,
      conversion_successful: currentStep === 'details' && !!customerDetails.name,
      drop_off_point: false,
      entry_point: window.location.pathname,
      interaction_path: {
        path: [currentStep],
        timestamps: [currentTime]
      }
    });

    trackInteraction('page_view', {
      step: currentStep,
      duration_seconds: timeInStage,
      has_selection: currentStep === 'services' ? selectedServices.length > 0 :
                    currentStep === 'datetime' ? !!selectedDate :
                    currentStep === 'barber' ? !!selectedBarber :
                    currentStep === 'details' ? !!customerDetails.name : false
    });

    stepStartTimeRef.current = currentTime;
  }, [currentStep]);

  return {
    trackUpsellInteraction: (type: string, details: Record<string, any>) => {
      trackInteraction(type, details);
    }
  };
};
