
import { useState } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { StepRenderer } from "./steps/StepRenderer";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { useBookingContext } from "@/contexts/BookingContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { UpsellManager } from "./upsell/UpsellManager";
import { PackageManager } from "./package/PackageManager";
import { BookingStepManager } from "./steps/BookingStepManager";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const RefactoredBookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    validateStep = () => true,
    totalPrice,
    totalDuration
  } = useBookingContext();

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    
    // Direct navigation as a fallback
    setCurrentStep(typedStep);
  };

  return (
    <ErrorBoundary>
      <BookingStepManager branch={branch} />
      
      {/* These components don't render anything visible, they just manage state and show modals */}
      <UpsellManager 
        onStepChange={setCurrentStep}
      />
      
      <PackageManager
        onStepChange={setCurrentStep}
      />
    </ErrorBoundary>
  );
};
