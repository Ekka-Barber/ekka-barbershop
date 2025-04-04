
import { useState, useCallback, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UpsellManager } from "./upsell/UpsellManager";
import { PackageManager } from "./package/PackageManager";
import { BookingStepManager } from "./steps/BookingStepManager";
import { useBookingContext } from "@/contexts/BookingContext";
import { logger } from "@/utils/logger";

interface BookingStepsProps {
  branch: any;
}

export const RefactoredBookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
  
  const {
    currentStep,
    setCurrentStep,
    validateStep
  } = useBookingContext();

  const handleStepChange = useCallback((step: string) => {
    // Show optimistic update for better user experience
    setIsOptimisticUpdate(true);
    
    // Optimistically update the step
    setCurrentStep(step);
    
    // Simulate network delay and then validate
    setTimeout(() => {
      if (validateStep && !validateStep()) {
        // If validation fails, show error and potentially revert
        toast({
          title: language === 'ar' ? 'خطأ في التحقق' : 'Validation Error',
          description: language === 'ar' 
            ? 'يرجى التأكد من إكمال جميع البيانات المطلوبة' 
            : 'Please ensure all required information is completed',
          variant: "destructive"
        });
      }
      setIsOptimisticUpdate(false);
    }, 300);
  }, [setCurrentStep, validateStep, toast, language]);

  // Effect to preserve state when navigating back
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (currentStep !== 'services') {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    logger.debug('Added beforeunload event listener');
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      logger.debug('Removed beforeunload event listener');
    };
  }, [currentStep]);
  
  return (
    <ErrorBoundary>
      <BookingStepManager branch={branch} />
      
      {/* These components don't render anything visible, they just manage state and show modals */}
      <UpsellManager onStepChange={handleStepChange} />
      <PackageManager onStepChange={handleStepChange} />
    </ErrorBoundary>
  );
};
