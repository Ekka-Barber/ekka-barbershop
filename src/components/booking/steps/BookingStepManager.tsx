
import { useState, useEffect } from "react";
import { BookingStep } from "@/components/booking/BookingProgress";
import { useLanguage } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useBookingContext } from "@/contexts/BookingContext";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { useStepValidation } from "./validation/useStepValidation";
import { logger } from "@/utils/logger";

// Import refactored components
import { BookingProgressContainer } from "./components/BookingProgressContainer";
import { StepContentContainer } from "./components/StepContentContainer";
import { NavigationContainer } from "./components/NavigationContainer";
import { SummaryContainer } from "./components/SummaryContainer";

interface BookingStepManagerProps {
  branch: any;
}

export const BookingStepManager = ({
  branch
}: BookingStepManagerProps) => {
  const { language } = useLanguage();
  
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    validateStep,
    handleServiceRemove,
    totalPrice,
    totalDuration,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedBarber,
    setSelectedBarber,
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    selectedEmployee,
    handleServiceToggle,
    customerDetails,
    handleCustomerDetailsChange,
    isUpdatingPackage,
    handlePackageServiceUpdate,
    packageEnabled,
    packageSettings,
    bookingSteps,
    validateCustomerDetails
  } = useBookingContext();
  
  // Use the extracted validation hook
  const {
    isValidating,
    setIsValidating,
    formValid,
    setFormValid,
    handleValidationChange,
    isNextDisabled,
    handleNextStep,
    handlePrevStep
  } = useStepValidation({
    currentStep,
    selectedServices,
    selectedDate,
    selectedBarber,
    selectedTime,
    customerDetails,
    validateStep,
    validateCustomerDetails
  });

  useEffect(() => {
    if (currentStep === 'details') {
      logger.debug("BookingStepManager: On details step, current form validity:", formValid);
    }
  }, [currentStep, formValid]);
  
  // Reset form validation when moving away from the details step
  useEffect(() => {
    if (currentStep !== 'details') {
      setFormValid(false);
    }
  }, [currentStep, setFormValid]);

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    
    if (currentStep === 'details' && !formValid && typedStep !== 'barber') {
      // Don't allow proceeding if form is invalid
      return;
    }
    
    setCurrentStep(typedStep);
  };

  const onNextStep = async () => {
    const nextStep = await handleNextStep(bookingSteps);
    if (nextStep) {
      handleStepChange(nextStep);
    }
  };

  const onPrevStep = () => {
    const prevStep = handlePrevStep(bookingSteps);
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const currentStepIndex = bookingSteps.indexOf(currentStep as BookingStep);
  const shouldShowNavigation = currentStep === 'details';
  const shouldShowSummaryBar = selectedServices.length > 0 && currentStep !== 'details';

  const employeeWorkingHours = selectedEmployee?.working_hours ? 
    transformWorkingHours(selectedEmployee.working_hours) : null;
  
  if (categoriesLoading && currentStep === 'services') {
    return <SkeletonLoader />;
  }
  
  if (employeesLoading && currentStep === 'barber') {
    return <SkeletonLoader />;
  }

  logger.debug("BookingStepManager: Rendering with formValid =", formValid);

  return (
    <ErrorBoundary>
      <BookingProgressContainer 
        currentStep={currentStep as BookingStep}
        steps={bookingSteps}
        onStepClick={setCurrentStep}
        currentStepIndex={currentStepIndex}
      />

      <StepContentContainer 
        isValidating={isValidating}
        currentStep={currentStep}
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedServices={selectedServices}
        handleServiceToggle={handleServiceToggle}
        handleStepChange={handleStepChange}
        employees={employees}
        employeesLoading={employeesLoading}
        selectedBarber={selectedBarber}
        setSelectedBarber={setSelectedBarber}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        setSelectedDate={setSelectedDate}
        setSelectedTime={setSelectedTime}
        employeeWorkingHours={employeeWorkingHours}
        customerDetails={customerDetails}
        handleCustomerDetailsChange={handleCustomerDetailsChange}
        totalPrice={totalPrice}
        language={language}
        branch={branch}
        isUpdatingPackage={isUpdatingPackage}
        handlePackageServiceUpdate={handlePackageServiceUpdate}
        onRemoveService={handleServiceRemove}
        onValidationChange={handleValidationChange}
      />

      {shouldShowNavigation && (
        <NavigationContainer 
          currentStepIndex={currentStepIndex}
          steps={bookingSteps}
          currentStep={currentStep as BookingStep}
          setCurrentStep={setCurrentStep}
          isNextDisabled={isNextDisabled()}
          customerDetails={customerDetails}
          branch={branch}
          isFormValid={formValid}
        />
      )}

      {shouldShowSummaryBar && (
        <SummaryContainer 
          selectedServices={selectedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          isFirstStep={currentStepIndex === 0}
          packageEnabled={packageEnabled}
          packageSettings={packageSettings}
          availableServices={[]}
          onAddService={handleServiceToggle}
          isValidating={isValidating}
        />
      )}
    </ErrorBoundary>
  );
};
