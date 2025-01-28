import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookingStep } from "@/components/booking/BookingProgress";

interface BookingNavigationProps {
  currentStepIndex: number;
  steps: BookingStep[];
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  isNextDisabled: boolean;
  customerDetails: {
    name: string;
    phone: string;
  };
  branch: any;
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
  const { t, language } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={() => {
            if (currentStepIndex > 0) {
              setCurrentStep(steps[currentStepIndex - 1]);
            } else {
              navigate('/customer');
            }
          }}
          className="flex-1"
        >
          {currentStepIndex === 0 ? t('back.home') : t('previous')}
        </Button>
        
        {currentStepIndex < steps.length - 1 && (
          <Button
            onClick={() => setCurrentStep(steps[currentStepIndex + 1])}
            className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
            disabled={isNextDisabled}
          >
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
};