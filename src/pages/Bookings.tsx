import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";
import { BookingHeader } from "@/components/booking/BookingHeader";
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";

const STEPS: BookingStep[] = ['services', 'datetime', 'barber', 'details'];

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

const Bookings = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const branchId = searchParams.get('branch');

  const [currentStep, setCurrentStep] = useState<BookingStep>('services');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedBarber, setSelectedBarber] = useState<string | undefined>(undefined);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Fetch branch details
  const { data: branch, isLoading: branchLoading } = useQuery({
    queryKey: ['branch', branchId],
    queryFn: async () => {
      if (!branchId) return null;
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!branchId,
  });

  // Fetch service categories with their services
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          services (
            id,
            name_en,
            name_ar,
            description_en,
            description_ar,
            price,
            duration
          )
        `);
      
      if (categoriesError) throw categoriesError;
      return categories;
    },
  });

  // Fetch employees for the selected branch
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

  const currentStepIndex = STEPS.indexOf(currentStep);
  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0);

  const handleServiceToggle = (service: any) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    if (isSelected) {
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    } else {
      setSelectedServices(prev => [...prev, {
        id: service.id,
        name: language === 'ar' ? service.name_ar : service.name_en,
        price: service.price,
        duration: service.duration
      }]);
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 9; // Start at 9 AM
    let minutes = 0;
    
    while (hour < 22) { // End at 10 PM
      slots.push(format(new Date().setHours(hour, minutes), 'HH:mm'));
      minutes += 30;
      if (minutes === 60) {
        minutes = 0;
        hour += 1;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleCustomerDetailsChange = (field: keyof typeof customerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!branchId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {t('select.branch')}
          </h1>
          <Button 
            className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={() => navigate('/customer')}
          >
            {t('go.back')}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="flex-grow max-w-md mx-auto w-full pt-8 px-4 sm:px-6 lg:px-8">
        <BookingHeader
          branchName={language === 'ar' ? branch?.name_ar : branch?.name}
          branchAddress={language === 'ar' ? branch?.address_ar : branch?.address}
          isLoading={branchLoading}
        />

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

          {currentStep === 'datetime' && (
            <DateTimeSelection
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
              timeSlots={timeSlots}
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
                selectedBarber={selectedBarber}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => {
              if (currentStepIndex > 0) {
                setCurrentStep(STEPS[currentStepIndex - 1]);
              } else {
                navigate('/customer');
              }
            }}
            className="flex-1"
          >
            {currentStepIndex === 0 ? t('back.home') : t('previous')}
          </Button>
          
          {currentStepIndex < STEPS.length - 1 && (
            <Button
              onClick={() => setCurrentStep(STEPS[currentStepIndex + 1])}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={
                (currentStep === 'services' && selectedServices.length === 0) ||
                (currentStep === 'datetime' && (!selectedDate || !selectedTime)) ||
                (currentStep === 'barber' && !selectedBarber)
              }
            >
              {t('next')}
            </Button>
          )}
          
          {currentStepIndex === STEPS.length - 1 && (
            <Button
              onClick={() => {
                // Handle booking submission
                console.log('Booking submitted:', {
                  services: selectedServices,
                  date: selectedDate,
                  time: selectedTime,
                  barber: selectedBarber,
                  customer: customerDetails
                });
              }}
              className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
              disabled={!customerDetails.name || !customerDetails.phone}
            >
              {t('confirm.booking')}
            </Button>
          )}
        </div>
      </div>
      <LanguageSwitcher />
    </div>
  );
};

export default Bookings;
