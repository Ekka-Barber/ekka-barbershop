
import { useNavigate, useLocation } from 'react-router-dom';
import { BookingStep } from '@/components/booking/BookingProgress';
import { SelectedService } from '@/types/service';
import { CustomerDetails, Branch } from '@/types/booking';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export const useBookingNavigation = (
  currentStep: BookingStep,
  selectedServices: SelectedService[],
  customerDetails: CustomerDetails,
  branch: Branch | null
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  const getBranchParam = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('branch');
  };

  const preserveBranchInUrl = (path: string) => {
    const branchId = getBranchParam();
    if (!branchId) {
      console.error('No branch ID found in URL');
      toast.error(language === 'ar' ? 'يرجى تحديد الفرع أولاً' : 'Please select a branch first');
      navigate('/customer');
      return null;
    }
    return `${path}?branch=${branchId}`;
  };

  const validateStep = (step: BookingStep): boolean => {
    if (!branch) {
      toast.error(language === 'ar' ? 'يرجى تحديد الفرع أولاً' : 'Please select a branch first');
      return false;
    }

    switch (step) {
      case 'services':
        return true;
      case 'datetime':
        if (selectedServices.length === 0) {
          toast.error(language === 'ar' ? 'يرجى اختيار الخدمات أولاً' : 'Please select services first');
          return false;
        }
        return true;
      case 'barber':
        // Add date/time validation if needed
        return true;
      case 'details':
        return true;
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    if (!branch) {
      console.error('No branch selected');
      return false;
    }

    switch (currentStep) {
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return true;
      case 'barber':
        return true;
      case 'details':
        return customerDetails.name.trim() !== '' && 
               customerDetails.phone.trim() !== '';
      default:
        return false;
    }
  };

  const handleBack = (currentStepIndex: number, steps: BookingStep[]) => {
    if (currentStepIndex > 0) {
      const previousStep = steps[currentStepIndex - 1];
      if (validateStep(previousStep)) {
        return previousStep;
      }
      return null;
    } else {
      const path = preserveBranchInUrl('/customer');
      if (path) navigate(path);
      return null;
    }
  };

  const handleNext = (currentStepIndex: number, steps: BookingStep[]) => {
    if (!canProceedToNext()) {
      toast.error(language === 'ar' 
        ? 'يرجى إكمال جميع الحقول المطلوبة' 
        : 'Please complete all required fields'
      );
      return null;
    }
    
    if (!branch) {
      console.error('No branch selected during next step');
      navigate('/customer');
      return null;
    }

    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (validateStep(nextStep)) {
        const path = preserveBranchInUrl('/bookings');
        if (path) {
          navigate(path);
          return nextStep;
        }
      }
    }
    return null;
  };

  return {
    handleBack,
    handleNext,
    canProceedToNext,
    getBranchParam,
    preserveBranchInUrl,
    validateStep
  };
};
