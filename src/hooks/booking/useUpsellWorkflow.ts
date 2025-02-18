
import { useState, useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';

export const useUpsellWorkflow = () => {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);

  const handleStepChange = useCallback((
    nextStep: BookingStep,
    availableUpsells: any[],
    selectedServices: any[],
    totalPrice: number
  ) => {
    console.log('Upsell workflow:', {
      nextStep,
      hasUpsells: availableUpsells?.length > 0,
      selectedServices: selectedServices.length,
      pendingStep
    });

    if (nextStep === 'datetime' && availableUpsells?.length > 0) {
      setShowUpsellModal(true);
      setPendingStep(nextStep);
      return true; // Prevent immediate step change
    }
    return false; // Allow step change
  }, [pendingStep]);

  const handleUpsellModalClose = useCallback(() => {
    setShowUpsellModal(false);
    const step = pendingStep;
    setPendingStep(null);
    return step;
  }, [pendingStep]);

  return {
    showUpsellModal,
    pendingStep,
    handleStepChange,
    handleUpsellModalClose,
    setPendingStep
  };
};
