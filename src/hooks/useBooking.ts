
import { useState } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { calculateTotalPrice, calculateTotalDuration } from '@/utils/bookingCalculations';
import { useServiceSelection } from './useServiceSelection';
import { useCustomerDetails } from './useCustomerDetails';
import { useCategoryData } from './useCategoryData';
import { useEmployeeData } from './useEmployeeData';
import { transformServicesForDisplay } from '@/utils/serviceTransformation';
import { usePackageDiscount } from './usePackageDiscount';
import { SelectedService } from '@/types/service';

export const useBooking = (branch: any) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);

  // Use our refactored hooks
  const { customerDetails, handleCustomerDetailsChange } = useCustomerDetails();
  const { selectedServices, handleServiceToggle, handleUpsellServiceAdd, setSelectedServices } = useServiceSelection();
  const { categories, categoriesLoading, employees, employeesLoading } = useCategoryData(branch?.id);
  const { selectedEmployee } = useEmployeeData(selectedBarber);
  const { packageEnabled, packageSettings } = usePackageDiscount(selectedServices);

  // Handle package confirmation
  const handlePackageConfirm = (services: SelectedService[]) => {
    // Remove currently selected services (non-upsell items)
    selectedServices.forEach(service => {
      if (!service.isUpsellItem) {
        handleServiceToggle(service);
      }
    });
    
    // Add new services from package builder
    services.forEach(service => {
      handleServiceToggle(service);
    });
  };

  // Calculate total price and duration
  const totalPrice = calculateTotalPrice(selectedServices);
  const totalDuration = calculateTotalDuration(selectedServices);

  // Transform selected services for display based on language
  const getTransformedServices = (language: 'en' | 'ar') => {
    return transformServicesForDisplay(selectedServices, language);
  };

  return {
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
    categories,
    categoriesLoading,
    employees,
    employeesLoading,
    selectedEmployee,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageConfirm,
    totalPrice,
    totalDuration,
    getTransformedServices,
    packageEnabled,
    packageSettings
  };
};
