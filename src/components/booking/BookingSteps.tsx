
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

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const { language } = useLanguage();
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
  const isNextDisabled = currentStep === 'services' ? selectedServices.length === 0 : 
                        currentStep === 'datetime' ? !selectedDate :
                        currentStep === 'barber' ? !selectedBarber || !selectedTime :
                        currentStep === 'details' ? !customerDetails.name || !customerDetails.phone :
                        false;

  const employeeWorkingHours = selectedEmployee?.working_hours 
    ? transformWorkingHours(selectedEmployee.working_hours)
    : null;

  // Show the summary bar for all steps except the details step
  const shouldShowSummaryBar = currentStep !== 'details' && selectedServices.length > 0;

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
          isNextDisabled={isNextDisabled}
          customerDetails={customerDetails}
          branch={branch}
        />
      )}

      {shouldShowSummaryBar && (
        <ServicesSummary
          selectedServices={selectedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={() => handleStepChange(STEPS[currentStepIndex + 1])}
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
