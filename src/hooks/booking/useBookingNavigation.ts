
import { useNavigate, useLocation } from 'react-router-dom';
import { BookingStep } from '@/components/booking/BookingProgress';
import { SelectedService } from '@/types/service';
import { CustomerDetails, Branch } from '@/types/booking';

export const useBookingNavigation = (
  currentStep: BookingStep,
  selectedServices: SelectedService[],
  customerDetails: CustomerDetails,
  branch: Branch | null
) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getBranchParam = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('branch');
  };

  const preserveBranchInUrl = (path: string) => {
    const branchId = getBranchParam();
    return branchId ? `${path}?branch=${branchId}` : path;
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return true; // Add date/time validation if needed
      case 'barber':
        return true; // Add barber validation if needed
      case 'details':
        return customerDetails.name && customerDetails.phone;
      default:
        return false;
    }
  };

  const handleBack = (currentStepIndex: number, steps: BookingStep[]) => {
    if (currentStepIndex > 0) {
      return steps[currentStepIndex - 1];
    } else {
      // When on first step, go back to customer page with branch param
      const path = preserveBranchInUrl('/customer');
      navigate(path);
      return null;
    }
  };

  const handleNext = (currentStepIndex: number, steps: BookingStep[]) => {
    if (!canProceedToNext()) {
      return null;
    }
    
    if (currentStepIndex < steps.length - 1) {
      return steps[currentStepIndex + 1];
    }
    return null;
  };

  return {
    handleBack,
    handleNext,
    canProceedToNext,
    getBranchParam,
    preserveBranchInUrl
  };
};
