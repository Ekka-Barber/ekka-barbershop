
import { useNavigate } from "react-router-dom";
import { BookingStep } from "./BookingProgress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppIntegration } from "./WhatsAppIntegration";
import { CustomerDetails, Branch } from "@/types/booking";
import { useBookingContext } from "@/contexts/BookingContext";

interface BookingNavigationProps {
  currentStepIndex: number;
  steps: BookingStep[];
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  isNextDisabled: boolean;
  customerDetails: CustomerDetails;
  branch?: Branch;
  isFormValid?: boolean;
}

export const BookingNavigation = ({ 
  currentStepIndex, 
  steps, 
  currentStep, 
  setCurrentStep, 
  isNextDisabled, 
  customerDetails,
  branch,
  isFormValid = false
}: BookingNavigationProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { selectedServices, selectedDate, selectedTime, selectedBarber, totalPrice, employees } = 
    useBookingContext();

  const selectedBarberName = employees?.find(e => e.id === selectedBarber)?.name || '';
  
  const handlePrevClick = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    } else {
      navigate('/');
    }
  };
  
  const handleNextClick = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };
  
  return (
    <div 
      className="sticky bottom-0 left-0 w-full bg-white/95 backdrop-blur-sm shadow-md border-t border-gray-200 flex flex-col gap-4 z-10 p-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
      style={{
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      {currentStep === 'details' && (
        <WhatsAppIntegration
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBarberName={selectedBarberName}
          customerDetails={customerDetails}
          branch={branch}
          isFormValid={isFormValid}
        />
      )}
      
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handlePrevClick}
        >
          {t('previous')}
        </Button>
        
        {currentStepIndex < steps.length - 1 ? (
          <Button
            className="flex-1"
            onClick={handleNextClick}
            disabled={isNextDisabled}
          >
            {t('next')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
