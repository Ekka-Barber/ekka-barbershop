
import { useState, useRef } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
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
  
  const upsellManagerRef = useRef<any>(null);
  const packageManagerRef = useRef<any>(null);
  
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    validateStep,
    totalPrice,
    totalDuration,
    selectedEmployee
  } = useBookingContext();

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    
    if (currentStep === 'services' && typedStep === 'datetime') {
      // First try package manager
      if (packageManagerRef.current?.initiatePackageFlow(typedStep)) {
        return;
      }
      
      // Then try upsell manager if package flow wasn't initiated
      if (upsellManagerRef.current?.initiateUpsellFlow(typedStep)) {
        return;
      }
    }
    
    // Default case - direct navigation
    setCurrentStep(typedStep);
  };

  return (
    <ErrorBoundary>
      <BookingStepManager branch={branch} />
      
      {/* These components don't render anything visible, they just manage state and show modals */}
      <UpsellManager 
        onStepChange={setCurrentStep}
        ref={upsellManagerRef}
      />
      
      <PackageManager
        onStepChange={setCurrentStep}
        ref={packageManagerRef}
      />
    </ErrorBoundary>
  );
};
