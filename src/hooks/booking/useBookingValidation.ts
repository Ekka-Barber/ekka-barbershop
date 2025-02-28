
import { CustomerDetails } from './useBookingState';
import { BookingStep } from '@/components/booking/BookingProgress';
import { SelectedService } from '@/types/service';
import { useBookingSettings } from '@/hooks/useBookingSettings';

export const useBookingValidation = (
  selectedServices: SelectedService[],
  selectedDate: Date | undefined,
  selectedTime: string | undefined,
  selectedBarber: string | undefined,
  customerDetails: CustomerDetails,
  termsAccepted?: boolean
) => {
  const { data: bookingSettings } = useBookingSettings();
  const requireTermsAcceptance = bookingSettings?.require_terms_acceptance ?? true;

  const canProceedToNextStep = (step: BookingStep): boolean | string => {
    switch (step) {
      case 'services':
        return selectedServices.length > 0 || 'Please select at least one service';
      
      case 'datetime':
        return !!selectedDate || 'Please select a date';
      
      case 'barber':
        return !!selectedBarber && !!selectedTime || 'Please select a barber and time slot';
      
      case 'customer':
        return validateCustomerDetailsAndTerms();
      
      case 'summary':
        return true;
      
      default:
        return false;
    }
  };

  const validateCustomerDetailsAndTerms = (): boolean | string => {
    if (!customerDetails.name.trim()) {
      return 'Please enter your name';
    }
    
    if (!customerDetails.phone.trim() || customerDetails.phone.length < 10) {
      return 'Please enter a valid phone number';
    }
    
    if (!customerDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      return 'Please enter a valid email address';
    }
    
    if (requireTermsAcceptance && !termsAccepted) {
      return 'Please accept the terms and conditions';
    }
    
    return true;
  };

  return {
    canProceedToNextStep
  };
};
