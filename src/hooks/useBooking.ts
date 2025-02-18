
import { CustomerDetails, Branch, Employee } from '@/types/booking';
import { Service, SelectedService } from '@/types/service';
import { useBookingState } from './booking/useBookingState';
import { useServiceManagement } from './booking/useServiceManagement';
import { useEmployeeManagement } from './booking/useEmployeeManagement';
import { useUpsellManagement } from './booking/useUpsellManagement';

export const useBooking = (branch: Branch) => {
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
    setCustomerDetails
  } = useBookingState();

  const {
    categories,
    categoriesLoading,
    handleServiceToggle: baseHandleServiceToggle
  } = useServiceManagement();

  const {
    employees,
    employeesLoading,
    selectedEmployee,
    employeeWorkingHours
  } = useEmployeeManagement(branch);

  const { handleUpsellServiceAdd: baseHandleUpsellServiceAdd } = useUpsellManagement();

  const handleServiceToggle = (service: Service, skipDiscountCalculation: boolean = false) => {
    baseHandleServiceToggle(service, selectedServices, setSelectedServices, skipDiscountCalculation);
  };

  const handleUpsellServiceAdd = (upsellServices: any[]) => {
    baseHandleUpsellServiceAdd(upsellServices, selectedServices, setSelectedServices);
  };

  const handleCustomerDetailsChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'services':
        return selectedServices.length > 0;
      case 'datetime':
        return !!selectedDate && !!selectedTime;
      case 'barber':
        return !!selectedBarber;
      case 'details':
        return !!customerDetails.name && !!customerDetails.phone;
      default:
        return false;
    }
  };

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
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    employeeWorkingHours,
    handleServiceToggle,
    handleUpsellServiceAdd,
    totalPrice,
    canProceedToNext,
    branch
  };
};
