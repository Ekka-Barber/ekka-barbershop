
import { useState, useCallback } from "react";
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

export const RefactoredBookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const {
    currentStep,
    setCurrentStep,
    hasBaseService,
    packageSettings,
    enabledPackageServices
  } = useBookingContext();

  const handleStepChange = useCallback((step: BookingStep) => {
    setCurrentStep(step);
  }, [setCurrentStep]);

  // We use the direct step change function rather than refs
  // This allows the managers to use their own internal logic
  
  return (
    <ErrorBoundary>
      <BookingStepManager branch={branch} />
      
      {/* These components don't render anything visible, they just manage state and show modals */}
      <UpsellManager onStepChange={handleStepChange} />
      <PackageManager onStepChange={handleStepChange} />
    </ErrorBoundary>
  );
};
