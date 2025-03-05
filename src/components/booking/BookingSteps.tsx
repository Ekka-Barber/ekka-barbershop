
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { StepRenderer } from "./steps/StepRenderer";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { transformServicesForDisplay, getBarberNameById } from "@/utils/serviceTransformation";
import { Branch } from "@/types/booking";
import { Button } from "@/components/ui/button";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: Branch;
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

  const {
    data: availableUpsells
  } = useBookingUpsells(selectedServices, language);

  const handleStepChange = (step: string) => {
    if (currentStep === 'services' && step === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep('datetime' as BookingStep);
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

  const handleBackToServices = () => {
    setCurrentStep('services');
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

  const isNextDisabled = () => {
    if (currentStep === 'services') return selectedServices.length === 0;
    if (currentStep === 'datetime') return !selectedDate;
    if (currentStep === 'barber') return !selectedBarber || !selectedTime;
    if (currentStep === 'details') return !customerDetails.name || !customerDetails.phone;
    return false;
  };

  const shouldShowNavigation = currentStep === 'details';

  const shouldShowSummaryBar = currentStep !== 'details' && selectedServices.length > 0;

  const showBackToServices = currentStep !== 'services';

  const transformedServices = transformServicesForDisplay(selectedServices, language);
  
  const selectedBarberName = getBarberNameById(employees, selectedBarber, language);

  return <>
      <BookingProgress 
        currentStep={currentStep} 
        steps={STEPS} 
        onStepClick={setCurrentStep} 
        currentStepIndex={currentStepIndex} 
      />

      {showBackToServices && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 text-muted-foreground" 
          onClick={handleBackToServices}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'العودة إلى الخدمات' : 'Back to services'}
        </Button>
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
          customerDetails={customerDetails}
          handleCustomerDetailsChange={handleCustomerDetailsChange}
          totalPrice={totalPrice}
          language={language}
          branch={branch}
          employeeWorkingHours={selectedEmployee?.working_hours || null}
          selectedBarberName={selectedBarberName}
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
