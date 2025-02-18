
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { BookingStep } from "@/components/booking/BookingProgress";
import { toast } from "sonner";
import { useBookingContext } from "@/contexts/BookingContext";
import { v4 as uuidv4 } from 'uuid';

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
  const { dispatch } = useBookingContext();

  const getBranchId = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('branch');
  };

  const handleNext = () => {
    const transactionId = uuidv4();
    dispatch({ 
      type: 'ACQUIRE_LOCK',
      payload: { componentId: 'navigation-next', transactionId }
    });
    try {
      const branchId = getBranchId();
      if (!branchId || !branch) {
        toast.error(language === 'ar' ? 'يرجى تحديد الفرع أولاً' : 'Please select a branch first');
        navigate('/customer');
        return;
      }

      if (onNextClick) {
        onNextClick();
      } else if (currentStepIndex < steps.length - 1) {
        setCurrentStep(steps[currentStepIndex + 1]);
      }
    } finally {
      dispatch({ 
        type: 'RELEASE_LOCK',
        payload: { transactionId }
      });
    }
  };

  const handleBack = () => {
    const transactionId = uuidv4();
    dispatch({ 
      type: 'ACQUIRE_LOCK',
      payload: { componentId: 'navigation-back', transactionId }
    });
    try {
      if (currentStepIndex > 0) {
        setCurrentStep(steps[currentStepIndex - 1]);
      } else {
        const branchId = getBranchId();
        if (!branchId) {
          console.warn('No branch ID found during back navigation');
        }
        navigate(`/customer${branchId ? `?branch=${branchId}` : ''}`);
      }
    } finally {
      dispatch({ 
        type: 'RELEASE_LOCK',
        payload: { transactionId }
      });
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
