
import { useState } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { StepRenderer } from "./StepRenderer";
import { useBookingContext } from "@/contexts/BookingContext";
import { ServicesSummary } from "../service-selection/ServicesSummary";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepManagerProps {
  branch: any;
}

export const BookingStepManager = ({
  branch
}: BookingStepManagerProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    validateStep,
    handleServiceRemove,
    totalPrice,
    totalDuration
  } = useBookingContext();

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    setCurrentStep(typedStep);
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep as BookingStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep as BookingStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep as BookingStep);
  const shouldShowNavigation = currentStep === 'details';
  const shouldShowSummaryBar = selectedServices.length > 0 && currentStep !== 'details';
  const transformedServices = transformServicesForDisplay(selectedServices, language);

  return (
    <ErrorBoundary>
      <BookingProgress 
        currentStep={currentStep as BookingStep} 
        steps={STEPS} 
        onStepClick={setCurrentStep} 
        currentStepIndex={currentStepIndex} 
      />

      <div className="mb-8">
        <ErrorBoundary>
          <StepRenderer 
            currentStep={currentStep}
            branch={branch}
            onRemoveService={handleServiceRemove}
          />
        </ErrorBoundary>
      </div>

      {shouldShowNavigation && (
        <ErrorBoundary>
          <BookingNavigation 
            currentStepIndex={currentStepIndex} 
            steps={STEPS} 
            currentStep={currentStep as BookingStep} 
            setCurrentStep={setCurrentStep}
            branch={branch} 
          />
        </ErrorBoundary>
      )}

      {shouldShowSummaryBar && (
        <ErrorBoundary>
          <ServicesSummary 
            selectedServices={transformedServices} 
            totalDuration={totalDuration} 
            totalPrice={totalPrice} 
            language={language} 
            onNextStep={handleNextStep} 
            onPrevStep={handlePrevStep} 
            isFirstStep={currentStepIndex === 0} 
          />
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
};
