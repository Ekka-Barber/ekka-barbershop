
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from '@/types/service';
import { BookingStep } from "@/components/booking/BookingProgress";

interface UseStepValidationProps {
  currentStep: string;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedBarber?: string;
  selectedTime?: string;
  customerDetails: any;
  validateStep?: () => boolean;
}

export const useStepValidation = ({
  currentStep,
  selectedServices,
  selectedDate,
  selectedBarber,
  selectedTime,
  customerDetails,
  validateStep
}: UseStepValidationProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [formValid, setFormValid] = useState(false);

  const handleValidationChange = (isValid: boolean) => {
    console.log("BookingStepManager: Setting form validity to:", isValid);
    setFormValid(isValid);
  };

  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !formValid;
    return false;
  };

  const handleNextStep = async (steps: BookingStep[]) => {
    setIsValidating(true);
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    
    if (currentIndex < steps.length - 1) {
      if (validateStep && await validateStep()) {
        const nextStep = steps[currentIndex + 1];
        return nextStep;
      }
    }
    setIsValidating(false);
    return null;
  };

  const handlePrevStep = (steps: BookingStep[]) => {
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex > 0) {
      return steps[currentIndex - 1];
    }
    return null;
  };

  return {
    isValidating,
    setIsValidating,
    formValid,
    setFormValid,
    handleValidationChange,
    isNextDisabled,
    handleNextStep,
    handlePrevStep
  };
};
