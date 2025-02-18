
import { useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { StepRenderer } from "./steps/StepRenderer";
import { useUpsellWorkflow } from "@/hooks/booking/useUpsellWorkflow";
import { Branch } from "@/types/booking";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsContainerProps {
  branch: Branch;
}

export const BookingStepsContainer = ({ branch }: BookingStepsContainerProps) => {
  const { language } = useLanguage();
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
    totalPrice,
    currentStep,
    setCurrentStep,
    canProceedToNext
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

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
