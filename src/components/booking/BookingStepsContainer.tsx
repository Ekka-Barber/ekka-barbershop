
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";
import { useBookingTracking } from "@/hooks/booking/useBookingTracking";
import { useStepManager } from "@/hooks/booking/useStepManager";
import { useUpsellWorkflow } from "@/hooks/booking/useUpsellWorkflow";
import { Branch } from "@/types/booking";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsContainerProps {
  branch: Branch;
}

export const BookingStepsContainer = ({ branch }: BookingStepsContainerProps) => {
  const { language } = useLanguage();
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  const {
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
    totalPrice
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

  const { currentStep, setCurrentStep, canProceedToNext } = useStepManager(
    selectedServices,
    selectedDate,
    selectedBarber,
    selectedTime,
    customerDetails
  );

  useBookingTracking(
    currentStep,
    selectedServices,
    selectedDate,
    selectedBarber,
    customerDetails
  );

  const {
    showUpsellModal,
    handleStepChange: handleUpsellStepChange,
    handleUpsellModalClose,
    setPendingStep
  } = useUpsellWorkflow();

  const handleStepChange = (step: string) => {
    const wasUpsellHandled = handleUpsellStepChange(
      step,
      availableUpsells || [],
      selectedServices,
      totalPrice
    );
    
    if (!wasUpsellHandled) {
      setCurrentStep(step as BookingStep);
    }
  };

  const handleUpsellModalCloseWrapper = () => {
    const pendingStep = handleUpsellModalClose();
    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    handleUpsellModalCloseWrapper();
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const employeeWorkingHours = selectedEmployee?.working_hours 
    ? transformWorkingHours(selectedEmployee.working_hours)
    : null;

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

      {currentStep !== 'services' && (
        <BookingNavigation
          currentStepIndex={currentStepIndex}
          steps={STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isNextDisabled={!canProceedToNext()}
          customerDetails={customerDetails}
          branch={branch}
        />
      )}

      <UpsellModal
        isOpen={showUpsellModal}
        onClose={handleUpsellModalCloseWrapper}
        onConfirm={handleUpsellConfirm}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};
