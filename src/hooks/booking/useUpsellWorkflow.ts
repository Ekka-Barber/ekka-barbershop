
import { useState, useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { useTracking } from '@/hooks/useTracking';

export const useUpsellWorkflow = () => {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  const { trackInteraction } = useTracking();
  const stepStartTime = Date.now();

  const handleStepChange = useCallback((
    nextStep: string,
    availableUpsells: any[],
    selectedServices: any[],
    totalPrice: number
  ) => {
    if (nextStep === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep('datetime');
      
      trackInteraction('dialog_open', {
        dialog_type: 'upsell_modal',
        available_upsells: availableUpsells.length,
        current_services: selectedServices.length,
        total_price: totalPrice
      });
      return true;
    }
    return false;
  }, []);

  const handleUpsellModalClose = useCallback(() => {
    setShowUpsellModal(false);
    trackInteraction('dialog_close', {
      dialog_type: 'upsell_modal',
      duration_seconds: Math.floor((Date.now() - stepStartTime) / 1000)
    });
    return pendingStep;
  }, [pendingStep, stepStartTime]);

  return {
    showUpsellModal,
    pendingStep,
    handleStepChange,
    handleUpsellModalClose,
    setPendingStep
  };
};
