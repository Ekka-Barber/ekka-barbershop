import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WhatsAppIntegration } from "@/components/booking/WhatsAppIntegration";
import { WorkingHours, Category, Service } from "@/types/service";

const STEPS: BookingStep[] = ['services', 'barber', 'datetime', 'details'];

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface BookingStepsProps {
  branch: any; // You might want to type this properly
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
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
  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  // Fetch categories and services
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
            display_order,
            discount_type,
            discount_value
          )
        `)
        .order('display_order', { ascending: true });
      
      if (categoriesError) throw categoriesError;
      
      const typedCategories = categories.map(category => ({
        ...category,
        services: (category.services || []).map(service => ({
          ...service,
          discount_type: service.discount_type as "percentage" | "amount" | null
        })).sort((a, b) => a.display_order - b.display_order)
      })) as Category[];
      
      return typedCategories;
    },
  });

  // Fetch employees
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', branch?.id],
    queryFn: async () => {
      if (!branch?.id) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('branch_id', branch.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!branch?.id,
  });

  // Fetch selected employee details
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

  const selectedBarberName = selectedBarber 
    ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name']
    : undefined;

  const handleServiceToggle = (service: any) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      const discountedPrice = calculateDiscountedPrice(service);
      setSelectedServices(prev => [...prev, {
        id: service.id,
        name: language === 'ar' ? service.name_ar : service.name_en,
        price: roundPrice(discountedPrice),
        duration: service.duration,
        originalPrice: discountedPrice !== service.price ? roundPrice(service.price) : undefined
      }]);
    }
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

  return (
    <>
      <BookingProgress
        currentStep={currentStep}
        steps={STEPS}
        onStepClick={setCurrentStep}
        currentStepIndex={currentStepIndex}
      />

      <div className="mb-8">
        {currentStep === 'services' && (
          <ServiceSelection
            categories={categories}
            isLoading={categoriesLoading}
            selectedServices={selectedServices}
            onServiceToggle={handleServiceToggle}
          />
        )}

        {currentStep === 'barber' && (
          <BarberSelection
            employees={employees}
            isLoading={employeesLoading}
            selectedBarber={selectedBarber}
            onBarberSelect={setSelectedBarber}
          />
        )}

        {currentStep === 'datetime' && (
          <DateTimeSelection
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
            employeeWorkingHours={selectedEmployee?.working_hours as WorkingHours}
          />
        )}

        {currentStep === 'details' && (
          <div className="space-y-6">
            <CustomerForm
              customerDetails={customerDetails}
              onCustomerDetailsChange={handleCustomerDetailsChange}
            />

            <BookingSummary
              selectedServices={selectedServices}
              totalPrice={totalPrice}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedBarberName={selectedBarberName}
            />

            <WhatsAppIntegration
              selectedServices={selectedServices}
              totalPrice={totalPrice}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedBarberName={selectedBarberName}
              customerDetails={customerDetails}
              language={language}
              branch={branch}
            />
          </div>
        )}
      </div>

      <BookingNavigation
        currentStepIndex={currentStepIndex}
        steps={STEPS}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isNextDisabled={
          (currentStep === 'services' && selectedServices.length === 0) ||
          (currentStep === 'barber' && !selectedBarber) ||
          (currentStep === 'datetime' && (!selectedDate || !selectedTime))
        }
        customerDetails={customerDetails}
        branch={branch}
      />
    </>
  );
};
