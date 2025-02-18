
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
    // Only show upsell modal if going to datetime step and have upsells
    if (nextStep === 'datetime' && availableUpsells?.length > 0) {
      setShowUpsellModal(true);
      setPendingStep(nextStep);
      return false; // Don't prevent normal step change
    }
    return false;
  }, []);

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
