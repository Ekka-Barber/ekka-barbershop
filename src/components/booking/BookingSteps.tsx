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
import { WorkingHours } from "@/types/service";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
          services:upsell_service_id (
            id,
            name_en,
            name_ar,
            price,
            duration
          )
        `)
        .in('main_service_id', selectedServices.map(s => s.id));

      if (error) throw error;

      return data.map(upsell => ({
        id: upsell.services.id,
        name: language === 'ar' ? upsell.services.name_ar : upsell.services.name_en,
        price: upsell.services.price,
        duration: upsell.services.duration,
        discountPercentage: upsell.discount_percentage
      }));
    },
    enabled: selectedServices.length > 0
  });

  const currentStepIndex = STEPS.indexOf(currentStep);
  const selectedBarberName = selectedBarber 
    ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name']
    : undefined;

  const employeeWorkingHours = selectedEmployee?.working_hours as WorkingHours | undefined;

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
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
  };

  const handleNextStep = () => {
    if (currentStep === 'services' && availableUpsells?.length > 0) {
      setShowUpsellModal(true);
    } else {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
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
        onNextClick={handleNextStep}
      />

      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => {
          setShowUpsellModal(false);
          setCurrentStep('barber');
        }}
        onConfirm={handleUpsellConfirm}
        availableUpsells={availableUpsells || []}
      />
    </>
  );
};