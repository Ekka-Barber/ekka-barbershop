
import { useState, useEffect } from 'react';
import { BookingStep } from '@/components/booking/BookingProgress';
import { calculateTotalPrice, calculateTotalDuration } from '@/utils/bookingCalculations';
import { useServiceSelection } from "@/hooks/useServiceSelection";
import { useCustomerDetails } from './useCustomerDetails';
import { useCategoryData } from './useCategoryData';
import { useEmployeeData } from './useEmployeeData';
import { transformServicesForDisplay } from '@/utils/serviceTransformation';
import { usePackageDiscount } from './usePackageDiscount';
import { SelectedService, Service } from '@/types/service';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useBooking = (initialBranch: any) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [selectedBranch, setSelectedBranch] = useState<any>(initialBranch);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Use our refactored hooks
  const { customerDetails, handleCustomerDetailsChange } = useCustomerDetails();
  const {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd,
    handlePackageServiceUpdate,
    isUpdatingPackage
  } = useServiceSelection();
  
  // Pass the selected branch ID to useCategoryData
  const { categories, categoriesLoading, employees, employeesLoading } = useCategoryData(selectedBranch?.id);
  const { selectedEmployee } = useEmployeeData(selectedBarber);
  const { packageEnabled, packageSettings, hasBaseService, enabledPackageServices } = usePackageDiscount(selectedServices);

  // Handle service removal
  const handleServiceRemove = (serviceId: string) => {
    const serviceToRemove = selectedServices.find(s => s.id === serviceId);
    if (serviceToRemove) {
      handleServiceToggle(serviceToRemove);
    }
  };

  // Validate current step before proceeding
  const validateStep = () => {
    switch (currentStep) {
      case 'services':
        if (selectedServices.length === 0) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'الرجاء اختيار خدمة واحدة على الأقل'
              : 'Please select at least one service',
            variant: "default"  // Changed from "warning" to "default"
          });
          return false;
        }
        return true;
      case 'datetime':
        if (!selectedDate) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'الرجاء اختيار تاريخ'
              : 'Please select a date',
            variant: "default"  // Changed from "warning" to "default"
          });
          return false;
        }
        return true;
      case 'barber':
        if (!selectedBarber || !selectedTime) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'الرجاء اختيار حلاق ووقت للموعد'
              : 'Please select a barber and appointment time',
            variant: "default"  // Changed from "warning" to "default"
          });
          return false;
        }
        return true;
      case 'details':
        // Check basic customer details
        if (!customerDetails.name || !customerDetails.phone) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'الرجاء تعبئة الاسم ورقم الهاتف'
              : 'Please fill in your name and phone number',
            variant: "default"  // Changed from "warning" to "default"
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Calculate total price and duration with proper type handling
  const totalPrice = calculateTotalPrice(selectedServices as unknown as Service[]);
  const totalDuration = calculateTotalDuration(selectedServices as unknown as Service[]);

  // Find base service
  const baseService = selectedServices.find(s => 
    s.isBasePackageService || s.id === packageSettings?.baseServiceId
  ) || categories?.flatMap(c => c.services).find(s => s.id === packageSettings?.baseServiceId);

  // Transform selected services for display based on language
  const getTransformedServices = (language: 'en' | 'ar') => {
    // Cast the selected services to the correct type to avoid TS errors
    const servicesWithCorrectTypes = selectedServices.map(service => ({
      ...service,
      discount_type: service.discount_type as "amount" | "percentage"
    })) as Service[];
    
    return transformServicesForDisplay(selectedServices, language);
  };

  // Clear selected services when branch changes
  useEffect(() => {
    setSelectedServices([]);
    setSelectedBarber(undefined);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  }, [selectedBranch?.id, setSelectedServices]);

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
    handlePackageServiceUpdate,
    totalPrice,
    totalDuration,
    getTransformedServices,
    
    // New properties for the refactored components
    packageEnabled,
    packageSettings,
    hasBaseService,
    enabledPackageServices,
    baseService,
    validateStep,
    handleServiceRemove,
    isUpdatingPackage,
    
    // Branch selection
    selectedBranch,
    setSelectedBranch,
    
    // Mock properties for testing
    availableSlots: {},
    isLoadingSlots: false,
    slotError: null,
    fetchAvailableSlots: () => {},
  };
};
