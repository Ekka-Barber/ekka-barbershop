
import { useState, useCallback } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { CustomerDetails } from '@/types/booking';
import { SelectedService } from '@/types/service';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { VALIDATION_MESSAGES } from '@/constants/bookingConstants';

interface UseStepValidationProps {
  currentStep: string;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedBarber?: string;
  selectedTime?: string;
  customerDetails: CustomerDetails;
  validateStep?: () => boolean;
  validateCustomerDetails?: () => boolean;
}

export const useStepValidation = ({
  currentStep,
  selectedServices,
  selectedDate,
  selectedBarber,
  selectedTime,
  customerDetails,
  validateStep,
  validateCustomerDetails
}: UseStepValidationProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // Handle validation changes from child components
  const handleValidationChange = useCallback((isValid: boolean) => {
    logger.debug(`Step validation changed to: ${isValid}`);
    setFormValid(isValid);
  }, []);

  // Display toast with validation error
  const showValidationError = useCallback((step: string) => {
    // Get message from validation constants
    const message = VALIDATION_MESSAGES[step as keyof typeof VALIDATION_MESSAGES]?.[language as 'en' | 'ar'] || 
      (language === 'ar' ? 'يرجى التحقق من جميع الحقول المطلوبة' : 'Please check all required fields');
      
    toast({
      title: language === 'ar' ? 'تنبيه' : 'Validation Error',
      description: message,
      variant: "destructive",
      duration: 3000
    });
  }, [language, toast]);

  // Check if next button should be disabled
  const isNextDisabled = useCallback(() => {
    // If we're on the details step, check form validity
    if (currentStep === 'details') {
      if (validateCustomerDetails) {
        return !validateCustomerDetails();
      }
      return !formValid;
    }
    
    // For other steps, do basic validation
    switch (currentStep) {
      case 'services':
        return selectedServices.length === 0;
      case 'datetime':
        return !selectedDate;
      case 'barber':
        return !selectedBarber || !selectedTime;
      default:
        return false;
    }
  }, [currentStep, selectedServices, selectedDate, selectedBarber, selectedTime, formValid, validateCustomerDetails]);

  // Handle next step transition with validation
  const handleNextStep = useCallback(async (steps: BookingStep[]) => {
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex < 0 || currentIndex >= steps.length - 1) return null;
    
    // Set validating state for better UX
    setIsValidating(true);
    
    // Use the validateStep from context if available, otherwise use local validation
    const isStepValid = validateStep ? validateStep() : !isNextDisabled();
    
    if (!isStepValid) {
      showValidationError(currentStep);
      setIsValidating(false);
      return null;
    }
    
    setIsValidating(false);
    return steps[currentIndex + 1];
  }, [currentStep, isNextDisabled, validateStep, showValidationError]);

  // Handle previous step transition (no validation needed)
  const handlePrevStep = useCallback((steps: BookingStep[]) => {
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex <= 0) return null;
    
    return steps[currentIndex - 1];
  }, [currentStep]);

  return {
    isValidating,
    setIsValidating,
    formValid,
    setFormValid,
    handleValidationChange,
    isNextDisabled,
    handleNextStep,
    handlePrevStep,
    showValidationError
  };
};
