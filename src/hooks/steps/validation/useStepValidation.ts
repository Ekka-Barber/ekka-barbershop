
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from '@/types/service';
import { BookingStep } from "@/components/booking/BookingProgress";
import { logger } from '@/utils/logger';

/**
 * Interface for useStepValidation hook props
 * @interface UseStepValidationProps
 */
interface UseStepValidationProps {
  currentStep: string;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedBarber?: string;
  selectedTime?: string;
  customerDetails: any;
  validateStep?: () => boolean;
  validateCustomerDetails?: () => boolean; 
}

/**
 * Hook for handling booking step validation and navigation
 * Provides validation state and navigation controls with appropriate feedback
 * 
 * @param {UseStepValidationProps} props - Hook parameters
 * @returns {Object} Validation state and handler functions
 */
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

  /**
   * Updates form validation state
   * @param {boolean} isValid - Whether the form is currently valid
   */
  const handleValidationChange = (isValid: boolean) => {
    logger.debug("BookingStepManager: Setting form validity to:", isValid);
    setFormValid(isValid);
  };

  /**
   * Determines whether the next button should be disabled based on current step
   * @returns {boolean} Whether the next button should be disabled
   */
  const isNextDisabled = () => {
    if (currentStep === 'details') {
      // Use validateCustomerDetails if provided, otherwise fallback to formValid
      if (validateCustomerDetails) {
        return !validateCustomerDetails();
      }
      return !formValid;
    }
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    return false;
  };

  /**
   * Handles navigation to the next step, including validation
   * @param {BookingStep[]} steps - The array of booking steps
   * @returns {BookingStep | null} The next step if valid, or null if validation failed
   */
  const handleNextStep = async (steps: BookingStep[]) => {
    setIsValidating(true);
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    
    if (currentIndex < steps.length - 1) {
      if (validateStep && await validateStep()) {
        const nextStep = steps[currentIndex + 1];
        logger.info(`Navigating to next step: ${nextStep}`);
        return nextStep;
      }
      
      logger.warn(`Step validation failed for: ${currentStep}`);
    }
    setIsValidating(false);
    return null;
  };

  /**
   * Handles navigation to the previous step
   * @param {BookingStep[]} steps - The array of booking steps
   * @returns {BookingStep | null} The previous step or null if at first step
   */
  const handlePrevStep = (steps: BookingStep[]) => {
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex > 0) {
      const prevStep = steps[currentIndex - 1];
      logger.info(`Navigating to previous step: ${prevStep}`);
      return prevStep;
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
