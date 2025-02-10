
import { useState } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const { language } = useLanguage();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
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
    totalPrice
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

  const handleStepChange = (step: string) => {
    if (currentStep === 'services' && step === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
    } else {
      setCurrentStep(step as BookingStep);
    }
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isNextDisabled = currentStep === 'services' ? selectedServices.length === 0 : 
                        currentStep === 'datetime' ? !selectedDate || !selectedTime :
                        currentStep === 'barber' ? !selectedBarber :
                        currentStep === 'details' ? !customerDetails.name || !customerDetails.phone :
                        false;

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
          isNextDisabled={isNextDisabled}
          customerDetails={customerDetails}
          branch={branch}
        />
      )}

      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => {
          setShowUpsellModal(false);
          setCurrentStep('datetime');
        }}
        onConfirm={(selectedUpsells) => {
          selectedUpsells.forEach(upsell => {
            handleServiceToggle({
              id: upsell.id,
              name_en: upsell.name,
              name_ar: upsell.name,
              price: upsell.price,
              duration: upsell.duration,
              discount_type: 'percentage',
              discount_value: upsell.discountPercentage
            });
          });
          setCurrentStep('datetime');
        }}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};
