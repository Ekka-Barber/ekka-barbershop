
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
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { toast } from "sonner";
import { useBookingContext } from "@/contexts/BookingContext";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsContainerProps {
  branch: Branch;
}

export const BookingStepsContainer = ({ branch }: BookingStepsContainerProps) => {
  const { language } = useLanguage();
  const { dispatch } = useBookingContext();
  
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
    canProceedToNext,
    handleStepChange,
    isStepChangeLocked
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

  const {
    showUpsellModal,
    handleStepChange: handleUpsellStepChange,
    handleUpsellModalClose,
    setPendingStep
  } = useUpsellWorkflow();

  // Effect to set branch in context when component mounts or branch changes
  useEffect(() => {
    if (branch) {
      console.log('Setting branch in context:', branch);
      dispatch({ type: 'SET_BRANCH', payload: branch });
    } else {
      console.error('No branch provided to BookingStepsContainer');
      toast.error('Please select a branch to continue');
    }
  }, [branch, dispatch]);

  const handleMainStepChange = (step: BookingStep) => {
    if (isStepChangeLocked) {
      console.log('Step change locked, skipping...', { step });
      return;
    }

    dispatch({ type: 'LOCK_STEP_CHANGE' });
    try {
      console.log('Step change requested:', { from: currentStep, to: step });
      
      const shouldPreventStepChange = handleUpsellStepChange(
        step,
        availableUpsells || [],
        selectedServices,
        totalPrice
      );
      
      if (!shouldPreventStepChange) {
        handleStepChange(step);
      }
    } finally {
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    }
  };

  const handleUpsellModalCloseWrapper = () => {
    const pendingStep = handleUpsellModalClose();
    if (pendingStep) {
      handleStepChange(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    dispatch({ type: 'LOCK_STEP_CHANGE' });
    try {
      handleUpsellServiceAdd(selectedUpsells);
      handleUpsellModalCloseWrapper();
    } finally {
      dispatch({ type: 'UNLOCK_STEP_CHANGE' });
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);

  return (
    <ErrorBoundary>
      <BookingProgress
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={handleMainStepChange}
        currentStepIndex={currentStepIndex}
      />

      <div className="mb-8">
        <StepRenderer
          currentStep={currentStep}
          categories={categories}
          categoriesLoading={categoriesLoading}
          selectedServices={selectedServices}
          handleServiceToggle={handleServiceToggle}
          handleStepChange={handleMainStepChange}
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
          setCurrentStep={handleMainStepChange}
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
    </ErrorBoundary>
  );
};
