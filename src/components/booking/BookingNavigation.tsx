
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const { t, language } = useLanguage();

  const handleNext = () => {
    if (onNextClick) {
      onNextClick();
    } else if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    } else {
      // When going back to customer page, preserve the state and branch
      const searchParams = new URLSearchParams(location.search);
      const branchId = searchParams.get('branch');
      navigate(`/customer${branchId ? `?branch=${branchId}` : ''}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleBack}
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
      </div>
    </div>
  );
};
