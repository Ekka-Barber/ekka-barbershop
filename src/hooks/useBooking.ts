import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { BookingStep } from '@/types/booking';
import { Service, validateService, SelectedService } from '@/types/service';
import { useLanguage } from "@/contexts/LanguageContext";

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface UseBookingProps {
  branchId?: string | null;
}

export const useBooking = ({ branchId }: UseBookingProps = {}) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  const { language } = useLanguage();

  const { data: selectedBranch, isLoading: branchLoading } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          display_order,
          services (
            id,
            name_en,
            name_ar,
            description_en,
            description_ar,
            price,
            duration,
            category_id,
            display_order,
            discount_type,
            discount_value
          )
        `)
        .order('display_order', { ascending: true });
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      return categories?.map(category => ({
        ...category,
        services: category.services
          .map(service => ({
            ...service,
            category_id: category.id // Ensure category_id is set
          }))
          .map(validateService)
          .filter(Boolean) // Remove null values from invalid services
          .sort((a, b) => (a?.display_order || 0) - (b?.display_order || 0))
      }));
    },
  });

  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branchId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  const { data: selectedEmployee } = useQuery({
    queryKey: ['employee', selectedBarber],
    queryFn: async () => {
      if (!selectedBarber) return null;
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', selectedBarber)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBarber
  });

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      const discountedPrice = calculateDiscountedPrice(service);
      setSelectedServices(prev => [...prev, {
        ...service,
        price: roundPrice(discountedPrice),
        originalPrice: discountedPrice !== service.price ? roundPrice(service.price) : undefined,
        isUpsellItem: false
      }]);
    }
  };

  const handleUpsellServiceAdd = (upsellServices: any[]) => {
    upsellServices.forEach(upsell => {
      handleServiceToggle({
        id: upsell.id,
        name_en: upsell.name_en,
        name_ar: upsell.name_ar,
        price: upsell.discountedPrice,
        duration: upsell.duration,
        category_id: '', // Required by Service type
        display_order: 0, // Required by Service type
        description_en: null,
        description_ar: null,
        discount_type: 'percentage',
        discount_value: upsell.discountPercentage
      });
    });
  };

  const calculateDiscountedPrice = (service: any) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    if (service.discount_type === 'percentage') {
      return service.price - (service.price * (service.discount_value / 100));
    } else {
      return service.price - service.discount_value;
    }
  };

  const roundPrice = (price: number) => {
    const decimal = price % 1;
    if (decimal >= 0.5) {
      return Math.ceil(price);
    } else if (decimal <= 0.4) {
      return Math.floor(price);
    }
    return price;
  };

  const handleCustomerDetailsChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const clearBooking = () => {
    setSelectedServices([]);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setSelectedBarber(undefined);
    setCustomerDetails({
      name: '',
      phone: '',
      email: '',
      notes: ''
    });
  };

  const confirmBooking = async () => {
    // Implementation of booking confirmation
    try {
      // Add your booking confirmation logic here
      return true;
    } catch (error) {
      console.error('Error confirming booking:', error);
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
    handleServiceToggle,
    handleUpsellServiceAdd,
    totalPrice,
    clearBooking,
    confirmBooking,
    selectedBranch,
    branchLoading
  };
};
