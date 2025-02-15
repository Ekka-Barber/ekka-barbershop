
import { BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { WhatsAppIntegration } from "@/components/booking/WhatsAppIntegration";
import { Service, SelectedService, WorkingHours } from "@/types/service";

interface StepRendererProps {
  currentStep: BookingStep;
  categories: any[];
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  handleServiceToggle: (service: Service) => void;
  handleStepChange: (step: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedBarber: string | undefined;
  setSelectedBarber: (id: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string | undefined) => void;
  employeeWorkingHours: WorkingHours | null;
  customerDetails: any;
  handleCustomerDetailsChange: (field: string, value: string) => void;
  totalPrice: number;
  language: string;
  branch: any;
}

export const StepRenderer = ({
  currentStep,
  categories,
  categoriesLoading,
  selectedServices,
  handleServiceToggle,
  handleStepChange,
  employees,
  employeesLoading,
  selectedBarber,
  setSelectedBarber,
  selectedDate,
  selectedTime,
  setSelectedDate,
  setSelectedTime,
  customerDetails,
  handleCustomerDetailsChange,
  totalPrice,
  language,
  branch
}: StepRendererProps) => {
  // Calculate total duration from selected services
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);

  if (currentStep === 'services') {
    return (
      <ServiceSelection
        categories={categories}
        isLoading={categoriesLoading}
        selectedServices={selectedServices}
        onServiceToggle={handleServiceToggle}
        onStepChange={handleStepChange}
      />
    );
  }

  if (currentStep === 'datetime') {
    return (
      <DateTimeSelection
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    );
  }

  if (currentStep === 'barber') {
    return (
      <BarberSelection
        employees={employees}
        isLoading={employeesLoading}
        selectedBarber={selectedBarber}
        onBarberSelect={setSelectedBarber}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
        totalDuration={totalDuration} // Pass the calculated total duration
      />
    );
  }

  if (currentStep === 'details') {
    return (
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
          selectedBarberName={selectedBarber ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name_en'] : undefined}
          onRemoveService={(serviceId) => {
            const service = selectedServices.find(s => s.id === serviceId);
            if (service) {
              handleServiceToggle({
                id: service.id,
                category_id: '',
                name_en: service.name_en,
                name_ar: service.name_ar,
                description_en: null,
                description_ar: null,
                price: service.price,
                duration: service.duration,
                display_order: 0,
                discount_type: null,
                discount_value: null
              });
            }
          }}
        />
        <WhatsAppIntegration
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBarberName={selectedBarber ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name_en'] : undefined}
          customerDetails={customerDetails}
          language={language}
          branch={branch}
        />
      </div>
    );
  }

  return null;
};
