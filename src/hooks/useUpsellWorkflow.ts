
import { useState, useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';

export const useUpsellWorkflow = () => {
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
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
      return true;
    }
    return false;
  }, []);

  const handleUpsellModalClose = useCallback(() => {
    setShowUpsellModal(false);
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
