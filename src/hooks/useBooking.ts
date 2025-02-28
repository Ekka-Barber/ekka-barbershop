
import { useBookingState } from './booking/useBookingState';
import { useBookingServices } from './booking/useBookingServices';
import { useBookingUpsells } from './booking/useBookingUpsells';
import { useBookingEmployees } from './booking/useBookingEmployees';
import { useBookingValidation } from './booking/useBookingValidation';
import { useBookingActions } from './booking/useBookingActions';
import { Service } from '@/types/service';
import { BookingStep } from '@/components/booking/BookingProgress';

export type { CustomerDetails } from './booking/useBookingState';

export const useBooking = (branch?: any) => {
  const {
    currentStep,
    setCurrentStep,
    selectedServices,
    setSelectedServices,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedBarber,
    setSelectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    termsAccepted,
    setTermsAccepted
  } = useBookingState();

  const {
    categories,
    categoriesLoading,
    handleServiceToggle
  } = useBookingServices(
    selectedServices, 
    setSelectedServices,
    branch?.id // Pass branch ID to useBookingServices
  );

  const {
    handleUpsellServiceAdd
  } = useBookingUpsells(selectedServices, setSelectedServices);

  const {
    employees,
    employeesLoading,
    selectedEmployee
  } = useBookingEmployees(branch, selectedBarber);

  const {
    canProceedToNextStep
  } = useBookingValidation(selectedServices, selectedDate, selectedTime, selectedBarber, customerDetails, termsAccepted);

  const {
    createBooking,
    clearBookingData,
    totalPrice
  } = useBookingActions(
    selectedServices,
    selectedDate,
    selectedTime,
    selectedBarber,
    customerDetails,
    setSelectedServices,
    setSelectedDate,
    setSelectedTime,
    setSelectedBarber,
    setCustomerDetailsState,
    termsAccepted
  );

  // Helper function to update customer details state for the actions hook
  function setCustomerDetailsState(details: typeof customerDetails) {
    Object.keys(details).forEach(key => {
      const field = key as keyof typeof customerDetails;
      handleCustomerDetailsChange(field, details[field]);
    });
  }

  return {
    currentStep,
    setCurrentStep,
    selectedServices,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedBarber,
    setSelectedBarber,
    customerDetails,
    handleCustomerDetailsChange,
    termsAccepted,
    setTermsAccepted,
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    handleServiceToggle,
    handleUpsellServiceAdd,
    totalPrice,
    canProceedToNextStep,
    createBooking,
    clearBookingData
  };
};
