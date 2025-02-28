
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
  onNextClick?: () => void;
}

export const BookingNavigation = ({
  currentStepIndex,
  steps,
  currentStep,
  setCurrentStep,
  isNextDisabled,
  customerDetails,
  branch,
  onNextClick
}: BookingNavigationProps) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const handleNext = () => {
    if (onNextClick) {
      onNextClick();
    } else {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10">
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
              onClick={handleNext}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={isNextDisabled}
            >
              {t('next')}
            </Button>
          )}

          {currentStepIndex === steps.length - 1 && (
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={isNextDisabled}
            >
              {t('confirm.booking')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
