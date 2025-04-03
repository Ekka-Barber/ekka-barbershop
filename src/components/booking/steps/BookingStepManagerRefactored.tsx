import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { StepRenderer } from "./StepRenderer";
import { useBookingContext } from "@/contexts/BookingContext";
import { ServicesSummary } from "../service-selection/ServicesSummary";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";
import { useStepValidation } from "./validation/useStepValidation";
import { StepContent } from "./components/StepContent";
import { BookingNavigationWrapper } from "./components/BookingNavigationWrapper";
import { ServiceSummaryWrapper } from "./components/ServiceSummaryWrapper";
import { SelectedService } from "@/types/service";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

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
    packageSettings
  } = useBookingContext();
  
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
    validateStep
  });

  useEffect(() => {
    if (currentStep === 'details') {
      console.log("BookingStepManager: On details step, current form validity:", formValid);
    }
  }, [currentStep, formValid]);
  
  useEffect(() => {
    if (currentStep !== 'details') {
      setFormValid(false);
    }
  }, [currentStep, setFormValid]);

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    
    if (currentStep === 'details' && !formValid && typedStep !== 'barber') {
      return;
    }
    
    setCurrentStep(typedStep);
  };

  const onNextStep = async () => {
    const nextStep = await handleNextStep(STEPS);
    if (nextStep) {
      handleStepChange(nextStep);
    }
  };

  const onPrevStep = () => {
    const prevStep = handlePrevStep(STEPS);
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep as BookingStep);
  const shouldShowNavigation = currentStep === 'details';
  const shouldShowSummaryBar = selectedServices.length > 0 && currentStep !== 'details';
  const transformedServices = transformServicesForDisplay(selectedServices, language === 'ar' ? 'ar' : 'en');

  const employeeWorkingHours = selectedEmployee?.working_hours ? 
    transformWorkingHours(selectedEmployee.working_hours) : null;
  
  if (categoriesLoading && currentStep === 'services') {
    return <SkeletonLoader />;
  }
  
  if (employeesLoading && currentStep === 'barber') {
    return <SkeletonLoader />;
  }

  console.log("BookingStepManager: Rendering with formValid =", formValid);

  return (
    <ErrorBoundary>
      <BookingProgress 
        currentStep={currentStep as BookingStep} 
        steps={STEPS} 
        onStepClick={setCurrentStep} 
        currentStepIndex={currentStepIndex} 
      />

      <StepContent 
        isValidating={isValidating}
        language={language}
      >
        <ErrorBoundary>
          <StepRenderer 
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
        </ErrorBoundary>
      </StepContent>

      {shouldShowNavigation && (
        <BookingNavigationWrapper 
          currentStepIndex={currentStepIndex}
          steps={STEPS}
          currentStep={currentStep as BookingStep}
          setCurrentStep={setCurrentStep}
          isNextDisabled={isNextDisabled()}
          customerDetails={customerDetails}
          branch={branch}
          isFormValid={formValid}
        />
      )}

      {shouldShowSummaryBar && (
        <ServiceSummaryWrapper 
          transformedServices={transformedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={onNextStep}
          onPrevStep={onPrevStep}
          currentStepIndex={currentStepIndex}
          packageEnabled={packageEnabled}
          packageSettings={packageSettings}
          handleServiceToggle={handleServiceToggle}
          categories={categories}
          isValidating={isValidating}
        />
      )}
    </ErrorBoundary>
  );
};
