
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { CollapsibleSummary } from "./mobile/CollapsibleSummary";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedBarber,
    setSelectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    handleServiceToggle,
    handleUpsellServiceAdd,
    totalPrice,
    totalDuration
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

  const handleStepChange = (step: string) => {
    if (currentStep === 'services' && step === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep('datetime');
    } else {
      setCurrentStep(step as BookingStep);
    }
  };

  const validateStep = (): boolean => {
    if (currentStep === 'services') {
      return selectedServices.length > 0;
    }
    
    if (currentStep === 'datetime') {
      if (!selectedDate) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار تاريخ' : 'Please select a date',
          description: language === 'ar' ? 'يجب عليك اختيار تاريخ للمتابعة' : 'You must select a date to continue',
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    
    if (currentStep === 'barber') {
      if (!selectedBarber) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار حلاق' : 'Please select a barber',
          description: language === 'ar' ? 'يجب عليك اختيار حلاق للمتابعة' : 'You must select a barber to continue',
          variant: "destructive"
        });
        return false;
      }
      
      if (!selectedTime) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار وقت' : 'Please select a time',
          description: language === 'ar' ? 'يجب عليك اختيار وقت للمتابعة' : 'You must select a time slot to continue',
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    }
    
    return true;
  };

  const handleNextStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    } else {
      navigate('/customer');
    }
  };

  const handleUpsellModalClose = () => {
    setShowUpsellModal(false);
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    handleUpsellModalClose();
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  
  // Calculate if the next button should be disabled based on step
  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !customerDetails.name || !customerDetails.phone;
    return false;
  };

  const employeeWorkingHours = selectedEmployee?.working_hours 
    ? transformWorkingHours(selectedEmployee.working_hours)
    : null;

  // Only show the BookingNavigation in the details step
  const shouldShowNavigation = currentStep === 'details';
  
  // Show the summary bar for all steps except the details step
  const shouldShowSummaryBar = currentStep !== 'details' && selectedServices.length > 0;

  // Transform the selectedServices to match the expected format for ServicesSummary
  const transformedServices = selectedServices.map(service => ({
    id: service.id,
    name: language === 'ar' ? service.name_ar : service.name_en,
    price: service.price,
    duration: service.duration
  }));

  // Determine whether to show the mobile collapsible summary
  const shouldShowMobileSummary = isMobile && currentStep === 'details' && selectedServices.length > 0;

  return (
    <>
      <BookingProgress
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={setCurrentStep}
        currentStepIndex={currentStepIndex}
      />

      <div className="mb-8">
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
        />
      </div>

      {shouldShowNavigation && (
        <BookingNavigation
          currentStepIndex={currentStepIndex}
          steps={STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isNextDisabled={isNextDisabled()}
          customerDetails={customerDetails}
          branch={branch}
        />
      )}

      {shouldShowSummaryBar && !isMobile && (
        <ServicesSummary
          selectedServices={transformedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          isFirstStep={currentStepIndex === 0}
        />
      )}

      {shouldShowMobileSummary && (
        <CollapsibleSummary
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
        />
      )}

      <UpsellModal
        isOpen={showUpsellModal}
        onClose={handleUpsellModalClose}
        onConfirm={handleUpsellConfirm}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};
