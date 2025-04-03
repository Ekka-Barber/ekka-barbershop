
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { BookingStep } from "@/components/booking/BookingProgress";

interface BookingNavigationWrapperProps {
  currentStepIndex: number;
  steps: BookingStep[];
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  isNextDisabled: boolean;
  customerDetails: any;
  branch: any;
  isFormValid: boolean;
}

export const BookingNavigationWrapper = ({
  currentStepIndex,
  steps,
  currentStep,
  setCurrentStep,
  isNextDisabled,
  customerDetails,
  branch,
  isFormValid
}: BookingNavigationWrapperProps) => {
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
