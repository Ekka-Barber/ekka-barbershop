
import { useState, useCallback, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UpsellManager } from "./upsell/UpsellManager";
import { PackageManager } from "./package/PackageManager";
import { BookingStepManager } from "./steps/BookingStepManager";
import { useBookingContext } from "@/contexts/BookingContext";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isOptimisticUpdate, setIsOptimisticUpdate] = useState(false);
  
  const {
    currentStep,
    setCurrentStep,
    hasBaseService,
    packageSettings,
    enabledPackageServices,
    validateStep
  } = useBookingContext();

  const handleStepChange = useCallback((step: BookingStep) => {
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
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
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
