
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
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { SkeletonLoader } from "@/components/common/SkeletonLoader";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepManagerProps {
  branch: any;
}

export const BookingStepManager = ({
  branch
}: BookingStepManagerProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
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
  
  // Handle form validation for customer details step
  const handleValidationChange = (isValid: boolean) => {
    setFormValid(isValid);
  };

  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    
    // Add validation before changing steps
    if (currentStep === 'details' && !formValid && typedStep !== 'barber') {
      toast({
        title: language === 'ar' ? "يرجى إكمال جميع الحقول المطلوبة" : "Please complete all required fields",
        description: language === 'ar' 
          ? "تأكد من تعبئة جميع الحقول بشكل صحيح قبل المتابعة" 
          : "Make sure all fields are filled correctly before proceeding",
        variant: "destructive",
      });
      return;
    }
    
    setCurrentStep(typedStep);
  };

  const handleNextStep = async () => {
    setIsValidating(true);
    const currentIndex = STEPS.indexOf(currentStep as BookingStep);
    
    if (currentIndex < STEPS.length - 1) {
      if (validateStep && await validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
    setIsValidating(false);
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

  // Process employee working hours if available
  const employeeWorkingHours = selectedEmployee?.working_hours ? 
    transformWorkingHours(selectedEmployee.working_hours) : null;

  // Function to check if next button should be disabled
  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !formValid;
    return false;
  };
  
  // Show loading states for different steps
  if (categoriesLoading && currentStep === 'services') {
    return <SkeletonLoader />;
  }
  
  if (employeesLoading && currentStep === 'barber') {
    return <SkeletonLoader />;
  }

  return (
    <ErrorBoundary>
      <BookingProgress 
        currentStep={currentStep as BookingStep} 
        steps={STEPS} 
        onStepClick={setCurrentStep} 
        currentStepIndex={currentStepIndex} 
      />

      <div className="mb-8 relative">
        {isValidating && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
              <span className="text-sm text-gray-500">
                {language === 'ar' ? "جاري التحقق..." : "Validating..."}
              </span>
            </div>
          </div>
        )}
        
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
      </div>

      {shouldShowNavigation && (
        <ErrorBoundary>
          <BookingNavigation 
            currentStepIndex={currentStepIndex} 
            steps={STEPS} 
            currentStep={currentStep as BookingStep} 
            setCurrentStep={setCurrentStep}
            isNextDisabled={isNextDisabled()}
            customerDetails={customerDetails}
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
            packageEnabled={packageEnabled}
            packageSettings={packageSettings}
            availableServices={[]} 
            onAddService={(service) => handleServiceToggle(service)}
            isValidating={isValidating}
          />
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
};
