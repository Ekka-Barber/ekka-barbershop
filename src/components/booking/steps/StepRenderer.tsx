
import { BookingStep } from "@/components/booking/BookingProgress";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { BarberSelection } from "@/components/booking/BarberSelection";
import { CustomerForm } from "@/components/booking/CustomerForm";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { WhatsAppIntegration } from "@/components/booking/WhatsAppIntegration";
import { Service, SelectedService, WorkingHours } from "@/types/service";
import { CustomerDetails, Branch } from "@/types/booking";
import { createServiceFromSelected } from "@/utils/serviceTransformation";

interface StepRendererProps {
  currentStep: BookingStep;
  categories: any[] | undefined;
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  handleServiceToggle: (service: Service) => void;
  handleStepChange: (step: string) => void;
  employees: any[] | undefined;
  employeesLoading: boolean;
  selectedBarber: string | undefined;
  setSelectedBarber: (id: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string | undefined) => void;
  employeeWorkingHours: WorkingHours | null;
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: string, value: string) => void;
  totalPrice: number;
  language: 'en' | 'ar';
  branch: Branch;
  selectedBarberName?: string;
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
  branch,
  employeeWorkingHours,
  selectedBarberName
}: StepRendererProps) => {
  if (currentStep === 'services') {
    return (
      <ServiceSelection
        categories={categories || []}
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
        employees={employees || []}
        isLoading={employeesLoading}
        selectedBarber={selectedBarber}
        onBarberSelect={setSelectedBarber}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
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
          selectedBarberName={selectedBarberName}
          onRemoveService={(serviceId) => {
            const service = selectedServices.find(s => s.id === serviceId);
            if (service) {
              handleServiceToggle(createServiceFromSelected(service));
            }
          }}
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
    );
  }

  return null;
};
