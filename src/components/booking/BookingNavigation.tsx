
import { useNavigate } from "react-router-dom";
import { BookingStep } from "./BookingProgress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { WhatsAppIntegration } from "./WhatsAppIntegration";
import { CustomerDetails, Branch } from "@/types/booking";

interface BookingNavigationProps {
  currentStepIndex: number;
  steps: BookingStep[];
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  isNextDisabled: boolean;
  customerDetails: CustomerDetails;
  branch?: Branch;
}

export const BookingNavigation = ({ 
  currentStepIndex, 
  steps, 
  currentStep, 
  setCurrentStep, 
  isNextDisabled, 
  customerDetails,
  branch
}: BookingNavigationProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Import additional required props
  const { selectedServices, selectedDate, selectedTime, selectedBarber, totalPrice } = 
    useBookingContext();

  // Get the barber name from the employee list
  const { data: employees } = useEmployeeData();
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
    <div className="sticky bottom-0 left-0 w-full bg-white shadow-md p-4 flex flex-col gap-4 z-10">
      {currentStep === 'details' && (
        <WhatsAppIntegration
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBarberName={selectedBarberName}
          customerDetails={customerDetails}
          branch={branch}
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

// Add these imports at the top of the file
import { useBookingContext } from "@/contexts/BookingContext";
import { useEmployeeData } from "@/hooks/useEmployeeData";
