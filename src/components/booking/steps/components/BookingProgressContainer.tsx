
import React from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

interface BookingProgressContainerProps {
  currentStep: BookingStep;
  steps: BookingStep[];
  onStepClick: (step: BookingStep) => void;
  currentStepIndex: number;
}

export const BookingProgressContainer: React.FC<BookingProgressContainerProps> = ({
  currentStep,
  steps,
  onStepClick,
  currentStepIndex
}) => {
  return (
    <ErrorBoundary>
      <BookingProgress 
        currentStep={currentStep} 
        steps={steps} 
        onStepClick={onStepClick} 
        currentStepIndex={currentStepIndex} 
      />
    </ErrorBoundary>
  );
};
