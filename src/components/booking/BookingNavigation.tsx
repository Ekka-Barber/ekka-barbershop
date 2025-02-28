
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { BookingStep } from "./BookingProgress";

export interface BookingNavigationProps {
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  onConfirm: () => void;
  canProceed: boolean | string;
}

export const BookingNavigation = ({
  currentStep,
  setCurrentStep,
  onConfirm,
  canProceed,
}: BookingNavigationProps) => {
  const { language } = useLanguage();

  // Define steps in order for navigation
  const steps: BookingStep[] = [
    "services",
    "datetime",
    "barber",
    "customer",
    "summary",
  ];

  const currentStepIndex = steps.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goToNextStep = () => {
    if (typeof canProceed === "string") return;
    if (!canProceed) return;

    if (isLastStep) {
      onConfirm();
    } else {
      const nextStep = steps[currentStepIndex + 1];
      setCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    if (isFirstStep) return;
    const previousStep = steps[currentStepIndex - 1];
    setCurrentStep(previousStep);
  };

  const getErrorMessage = () => {
    if (typeof canProceed === "string") {
      return canProceed;
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4 shadow-md ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <Button
            onClick={goToPreviousStep}
            variant="outline"
            className={`px-4 ${isFirstStep ? "invisible" : ""}`}
          >
            {language === "ar" ? <ArrowRight className="ml-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
            {language === "ar" ? "السابق" : "Previous"}
          </Button>

          <div className="text-sm text-red-500 text-center">
            {errorMessage}
          </div>

          <Button
            onClick={goToNextStep}
            disabled={!canProceed || typeof canProceed === "string"}
            className="px-4 bg-[#C4A484] hover:bg-[#b3957b]"
          >
            {isLastStep ? (
              <>
                {language === "ar" ? "تأكيد الحجز" : "Confirm Booking"}
                <Check className={language === "ar" ? "mr-2 h-4 w-4" : "ml-2 h-4 w-4"} />
              </>
            ) : (
              <>
                {language === "ar" ? "التالي" : "Next"}
                {language === "ar" ? <ArrowLeft className="mr-2 h-4 w-4" /> : <ArrowRight className="ml-2 h-4 w-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
