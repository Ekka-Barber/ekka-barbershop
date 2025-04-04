
import React from "react";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BookingStep } from "@/components/booking/BookingProgress";

interface NavigationContainerProps {
  currentStepIndex: number;
  steps: BookingStep[];
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  isNextDisabled: boolean;
  customerDetails: any;
  branch: any;
  isFormValid: boolean;
}

export const NavigationContainer: React.FC<NavigationContainerProps> = ({
  currentStepIndex,
  steps,
  currentStep,
  setCurrentStep,
  isNextDisabled,
  customerDetails,
  branch,
  isFormValid
}) => {
  return (
    <ErrorBoundary>
      <BookingNavigation 
        currentStepIndex={currentStepIndex} 
        steps={steps} 
        currentStep={currentStep} 
        setCurrentStep={setCurrentStep}
        isNextDisabled={isNextDisabled}
        customerDetails={customerDetails}
        branch={branch}
        isFormValid={isFormValid}
      />
    </ErrorBoundary>
  );
};
