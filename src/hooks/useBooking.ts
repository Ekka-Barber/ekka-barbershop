
import { CustomerDetails } from '@/types/booking';
import { Service, SelectedService } from '@/types/service';
import { useBookingState } from './booking/useBookingState';
import { useServiceManagement } from './booking/useServiceManagement';
import { useEmployeeManagement } from './booking/useEmployeeManagement';
import { useUpsellManagement } from './booking/useUpsellManagement';

export const useBooking = (branch: any) => {
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
    selectedEmployee
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
    handleServiceToggle,
    handleUpsellServiceAdd,
    totalPrice
  };
};
