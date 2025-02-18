
import { useState, useCallback, useEffect } from 'react';
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

    // Only block step change and show modal if we have upsells and going to datetime
    if (nextStep === 'datetime' && availableUpsells?.length > 0) {
      setShowUpsellModal(true);
      setPendingStep(nextStep);
      return true; // Block step change
    }
    return false; // Allow step change
  }, [pendingStep]);

  const handleUpsellModalClose = useCallback(() => {
    setShowUpsellModal(false);
    const step = pendingStep;
    setPendingStep(null);
    return step;
  }, [pendingStep]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      setPendingStep(null);
      setShowUpsellModal(false);
    };
  }, []);

  return {
    showUpsellModal,
    pendingStep,
    handleStepChange,
    handleUpsellModalClose,
    setPendingStep
  };
};
