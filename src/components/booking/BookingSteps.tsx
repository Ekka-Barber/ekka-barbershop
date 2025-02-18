
import { useState, useEffect } from "react";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { transformWorkingHours } from "@/utils/workingHoursUtils";
import { StepRenderer } from "./steps/StepRenderer";
import { useTracking } from "@/hooks/useTracking";
import { MarketingFunnelStage } from "@/services/tracking/types";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const { language } = useLanguage();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const { trackMarketingFunnel, trackInteraction } = useTracking();

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
    totalPrice
  } = useBooking(branch);

  const { data: availableUpsells } = useBookingUpsells(selectedServices, language);

  // Track step changes and duration
  useEffect(() => {
    const currentTime = Date.now();
    const timeInStage = Math.floor((currentTime - stepStartTime) / 1000);

    // Map booking steps to marketing funnel stages
    const stepToFunnelStage: Record<BookingStep, MarketingFunnelStage> = {
      services: 'service_browse',
      datetime: 'datetime_select',
      barber: 'barber_select',
      details: 'booking_complete'
    };

    trackMarketingFunnel({
      funnel_stage: stepToFunnelStage[currentStep],
      time_in_stage: timeInStage,
      conversion_successful: currentStep === 'details' && !!customerDetails.name,
      drop_off_point: false,
      entry_point: window.location.pathname,
      interaction_path: {
        path: [currentStep],
        timestamps: [currentTime]
      }
    });

    // Track step change as interaction
    trackInteraction('page_view', {
      step: currentStep,
      duration_seconds: timeInStage,
      has_selection: currentStep === 'services' ? selectedServices.length > 0 :
                    currentStep === 'datetime' ? !!selectedDate :
                    currentStep === 'barber' ? !!selectedBarber :
                    currentStep === 'details' ? !!customerDetails.name : false
    });

    setStepStartTime(currentTime);
  }, [currentStep]);

  const handleStepChange = (step: string) => {
    if (currentStep === 'services' && step === 'datetime' && availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep('datetime');
      
      trackInteraction('dialog_open', {
        dialog_type: 'upsell_modal',
        available_upsells: availableUpsells.length,
        current_services: selectedServices.length,
        total_price: totalPrice
      });
    } else {
      setCurrentStep(step as BookingStep);
    }
  };

  const handleUpsellModalClose = () => {
    setShowUpsellModal(false);
    trackInteraction('dialog_close', {
      dialog_type: 'upsell_modal',
      duration_seconds: Math.floor((Date.now() - stepStartTime) / 1000)
    });

    if (pendingStep) {
      setCurrentStep(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    trackInteraction('service_select', {
      service_type: 'upsell',
      services_selected: selectedUpsells.map(u => u.id),
      total_selected: selectedUpsells.length,
      original_services: selectedServices.length
    });
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
        onClose={handleUpsellModalClose}
        onConfirm={handleUpsellConfirm}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};
