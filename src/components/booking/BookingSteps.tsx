import { BookingProgress, BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { BookingNavigation } from "@/components/booking/BookingNavigation";
import { WhatsAppIntegration } from "@/components/booking/WhatsAppIntegration";
import { useBooking } from "@/hooks/useBooking";
import { useLanguage } from "@/contexts/LanguageContext";
import { WorkingHours } from "@/types/service";

const STEPS: BookingStep[] = ['services', 'barber', 'datetime', 'details'];

interface BookingStepsProps {
  branch: any;
}

export const BookingSteps = ({ branch }: BookingStepsProps) => {
  const { language } = useLanguage();
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

  const currentStepIndex = STEPS.indexOf(currentStep);
  const selectedBarberName = selectedBarber 
    ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name']
    : undefined;

  const employeeWorkingHours = selectedEmployee?.working_hours as WorkingHours | undefined;

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
      />
    </>
  );
};