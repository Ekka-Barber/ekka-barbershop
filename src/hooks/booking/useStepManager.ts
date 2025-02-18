
import { useState, useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { CustomerDetails } from '@/types/booking';

export const useStepManager = (
  selectedServices: any[],
  selectedDate: Date | undefined,
  selectedBarber: string | undefined,
  selectedTime: string | undefined,
  customerDetails: CustomerDetails
) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');

  const isStepValid = useCallback((step: BookingStep): boolean => {
    switch (step) {
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return !!selectedDate;
      case 'barber':
        return !!selectedBarber && !!selectedTime;
      case 'details':
        return !!customerDetails.name && !!customerDetails.phone;
      default:
        return false;
    }
  }, [selectedServices, selectedDate, selectedBarber, selectedTime, customerDetails]);

  const canProceedToNext = useCallback((): boolean => {
    return isStepValid(currentStep);
  }, [currentStep, isStepValid]);

  return {
    currentStep,
    setCurrentStep,
    isStepValid,
    canProceedToNext
  };
};
