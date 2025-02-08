
import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { WhatsAppIntegration } from "@/components/booking/WhatsAppIntegration";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { WorkingHours } from "@/types/service";

const STEPS: BookingStep[] = ['services', 'barber', 'datetime', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const { language } = useLanguage();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const {
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
    totalPrice
  } = useBooking(branch);

  // Type guard to validate working hours structure
  const isValidWorkingHours = (hours: any): hours is WorkingHours => {
    if (!hours || typeof hours !== 'object') return false;
    
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return daysOfWeek.every(day => 
      !hours[day] || (Array.isArray(hours[day]) && hours[day].every((slot: any) => typeof slot === 'string'))
    );
  };

  // Safely transform working hours
  const transformWorkingHours = (rawHours: any): WorkingHours | null => {
    try {
      if (isValidWorkingHours(rawHours)) {
        return rawHours;
      }
      console.error('Invalid working hours format:', rawHours);
      return null;
    } catch (error) {
      console.error('Error transforming working hours:', error);
      return null;
    }
  };

  // Fetch available upsells for selected services
  const { data: availableUpsells } = useQuery({
    queryKey: ['upsells', selectedServices.map(s => s.id)],
    queryFn: async () => {
      if (selectedServices.length === 0) return [];
      
      const { data, error } = await supabase
        .from('service_upsells')
        .select(`
          upsell_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (
            id,
            name_en,
            name_ar,
            price,
            duration
          )
        `)
        .in('main_service_id', selectedServices.map(s => s.id));

      if (error) throw error;

      // Create a map to store unique upsells with their lowest discount percentage
      const upsellMap = new Map();

      data.forEach(upsell => {
        const existingUpsell = upsellMap.get(upsell.upsell.id);
        
        if (!existingUpsell || upsell.discount_percentage < existingUpsell.discountPercentage) {
          upsellMap.set(upsell.upsell.id, {
            id: upsell.upsell.id,
            name: language === 'ar' ? upsell.upsell.name_ar : upsell.upsell.name_en,
            price: upsell.upsell.price,
            duration: upsell.upsell.duration,
            discountPercentage: upsell.discount_percentage
          });
        }
      });

      return Array.from(upsellMap.values());
    },
    enabled: selectedServices.length > 0
  });

  const handleStepChange = (step: string) => {
    console.log('Changing step to:', step);
    setCurrentStep(step as BookingStep);
  };

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isNextDisabled = currentStep === 'services' ? selectedServices.length === 0 : 
                        currentStep === 'barber' ? !selectedBarber :
                        currentStep === 'datetime' ? !selectedDate || !selectedTime :
                        currentStep === 'details' ? !customerDetails.name || !customerDetails.phone :
                        false;

  // Transform working hours before passing to DateTimeSelection
  const employeeWorkingHours = selectedEmployee?.working_hours 
    ? transformWorkingHours(selectedEmployee.working_hours)
    : null;

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
            onStepChange={handleStepChange}
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
            employeeWorkingHours={employeeWorkingHours}
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
              selectedBarberName={selectedBarber ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name'] : undefined}
              onRemoveService={(serviceId) => {
                const service = selectedServices.find(s => s.id === serviceId);
                if (service) {
                  handleServiceToggle({
                    id: service.id,
                    name_en: service.name,
                    name_ar: service.name,
                    price: service.price,
                    duration: service.duration
                  });
                }
              }}
            />

            <WhatsAppIntegration
              selectedServices={selectedServices}
              totalPrice={totalPrice}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedBarberName={selectedBarber ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name'] : undefined}
              customerDetails={customerDetails}
              language={language}
              branch={branch}
            />
          </div>
        )}
      </div>

      {/* Show BookingNavigation for all steps except services */}
      {currentStep !== 'services' && (
        <BookingNavigation
          currentStepIndex={currentStepIndex}
          steps={STEPS}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isNextDisabled={isNextDisabled}
          customerDetails={customerDetails}
          branch={branch}
        />
      )}

      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => {
          setShowUpsellModal(false);
          setCurrentStep('barber');
        }}
        onConfirm={(selectedUpsells) => {
          selectedUpsells.forEach(upsell => {
            handleServiceToggle({
              id: upsell.id,
              name_en: upsell.name,
              name_ar: upsell.name,
              price: upsell.price,
              duration: upsell.duration,
              discount_type: 'percentage',
              discount_value: upsell.discountPercentage
            });
          });
          setCurrentStep('barber');
        }}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};
