
import { useState, useEffect, useCallback, useMemo } from "react";
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
import { ArrowLeft } from "lucide-react";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({
  branch
}: BookingStepsProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  
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

  const { data: availableUpsells = [] } = useBookingUpsells(selectedServices, language);
  
  // Memoize step change handler
  const handleStepChange = useCallback((step: string) => {
    if (currentStep === 'services' && step === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep('datetime');
    } else {
      setCurrentStep(step as BookingStep);
    }
  }, [currentStep, availableUpsells, setCurrentStep]);

  // Memoize validation function
  const validateStep = useCallback((): boolean => {
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
  }, [currentStep, selectedServices.length, selectedDate, selectedBarber, selectedTime, toast, language]);

  // Memoize navigation handlers
  const handleNextStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      if (validateStep()) {
        handleStepChange(STEPS[currentIndex + 1]);
      }
    }
  }, [currentStep, validateStep, handleStepChange]);

  const handlePrevStep = useCallback(() => {
    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1]);
    } else {
      navigate('/customer');
    }
  }, [currentStep, setCurrentStep, navigate]);

  const handleBackToServices = useCallback(() => {
    setCurrentStep('services');
  }, [setCurrentStep]);

  // Memoize modal handlers
  const handleUpsellModalClose = useCallback(() => {
    setShowUpsellModal(false);
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  }, [pendingStep, setCurrentStep]);

  const handleUpsellConfirm = useCallback((selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    handleUpsellModalClose();
  }, [handleUpsellServiceAdd, handleUpsellModalClose]);

  // Memoize derived state
  const currentStepIndex = useMemo(() => STEPS.indexOf(currentStep), [currentStep]);

  // Memoize disabled state calculation
  const isNextDisabled = useMemo(() => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !customerDetails.name || !customerDetails.phone;
    return false;
  }, [currentStep, selectedServices.length, selectedDate, selectedBarber, selectedTime, customerDetails]);

  const employeeWorkingHours = useMemo(() => 
    selectedEmployee?.working_hours ? transformWorkingHours(selectedEmployee.working_hours) : null, 
    [selectedEmployee?.working_hours]
  );

  // Memoize UI state flags
  const shouldShowNavigation = currentStep === 'details';
  const shouldShowSummaryBar = currentStep !== 'details' && selectedServices.length > 0;
  const showBackToServices = currentStep !== 'services';

  // Memoize transformed services
  const transformedServices = useMemo(() => selectedServices.map(service => ({
    id: service.id,
    name: language === 'ar' ? service.name_ar : service.name_en,
    price: service.price,
    duration: service.duration
  })), [selectedServices, language]);

  return <>
      <BookingProgress 
        currentStep={currentStep} 
        steps={STEPS} 
        onStepClick={setCurrentStep} 
        currentStepIndex={currentStepIndex} 
      />

      {showBackToServices && (
        <button 
          onClick={handleBackToServices}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services'}
        </button>
      )}

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
          isNextDisabled={isNextDisabled} 
          customerDetails={customerDetails} 
          branch={branch} 
        />
      )}

      {shouldShowSummaryBar && (
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

      <UpsellModal 
        isOpen={showUpsellModal} 
        onClose={handleUpsellModalClose} 
        onConfirm={handleUpsellConfirm} 
        availableUpsells={availableUpsells || []} 
      />
    </>;
};
