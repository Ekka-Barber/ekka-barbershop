
import { BookingStep } from "@/components/booking/BookingProgress";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PackageSettings } from "@/types/admin";
import { Service, SelectedService } from "@/types/service";

interface UseBookingStepTransitionProps {
  currentStep: string;
  setCurrentStep: (step: BookingStep) => void;
  selectedServices: SelectedService[];
  selectedDate?: Date;
  selectedBarber?: string;
  selectedTime?: string;
  hasBaseService: boolean;
  packageSettings?: PackageSettings;
  availablePackageServices: Service[];
  availableUpsells?: any[];
  setShowPackageBuilder: (show: boolean) => void;
  setShowUpsellModal: (show: boolean) => void;
  setPendingStep: (step: BookingStep | null) => void;
  toast: ReturnType<typeof useToast>['toast'];
  language: string;
  navigate: ReturnType<typeof useNavigate>;
}

export const useBookingStepTransition = ({
  currentStep,
  setCurrentStep,
  selectedServices,
  selectedDate,
  selectedBarber,
  selectedTime,
  hasBaseService,
  packageSettings,
  availablePackageServices,
  availableUpsells,
  setShowPackageBuilder,
  setShowUpsellModal,
  setPendingStep,
  toast,
  language,
  navigate
}: UseBookingStepTransitionProps) => {
  
  const handleStepChange = (step: string) => {
    const typedStep = step as BookingStep;
    if (currentStep === 'services') {
      if (typedStep === 'datetime') {
        if (hasBaseService && packageSettings && availablePackageServices.length > 0) {
          setShowPackageBuilder(true);
          setPendingStep(typedStep);
          return;
        }
        if (availableUpsells?.length) {
          setShowUpsellModal(true);
          setPendingStep(typedStep);
          return;
        }
      }
    }
    setCurrentStep(typedStep);
  };

  const validateStep = (): boolean => {
    if (currentStep === 'services') {
      return selectedServices.length > 0;
    }
    if (currentStep === 'datetime') {
      if (!selectedDate) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار تاريخ' : 'Please select a date',
          description: language === 'ar' ? 'يجب عليك اختيار تاريخ للمتابعة' : 'You must select a date to continue',
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    if (currentStep === 'barber') {
      if (!selectedBarber) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار حلاق' : 'Please select a barber',
          description: language === 'ar' ? 'يجب عليك اختيار حلاق للمتابعة' : 'You must select a barber to continue',
          variant: "destructive"
        });
        return false;
      }
      if (!selectedTime) {
        toast({
          title: language === 'ar' ? 'يرجى اختيار وقت' : 'Please select a time',
          description: language === 'ar' ? 'يجب عليك اختيار وقت للمتابعة' : 'You must select a time slot to continue',
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    const steps: BookingStep[] = ['services', 'datetime', 'barber', 'details'];
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex < steps.length - 1) {
      if (validateStep()) {
        handleStepChange(steps[currentIndex + 1]);
      }
    }
  };

  const handlePrevStep = () => {
    const steps: BookingStep[] = ['services', 'datetime', 'barber', 'details'];
    const currentIndex = steps.indexOf(currentStep as BookingStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      navigate('/customer');
    }
  };

  return {
    handleStepChange,
    validateStep,
    handleNextStep,
    handlePrevStep
  };
};
