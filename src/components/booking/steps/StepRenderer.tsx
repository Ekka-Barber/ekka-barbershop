
import { BookingStep } from "@/components/booking/BookingProgress";
import { ServiceStep } from "./ServiceStep";
import { DateTimeStep } from "./DateTimeStep";
import { BarberStep } from "./BarberStep";
import { DetailsStep } from "./DetailsStep";
import { Service, SelectedService, WorkingHours } from "@/types/service";
import { CustomerDetails, Branch, BarberDetails } from "@/types/booking";

interface StepRendererProps {
  currentStep: BookingStep;
  categories: any[];
  categoriesLoading: boolean;
  selectedServices: SelectedService[];
  handleServiceToggle: (service: Service) => void;
  handleStepChange: (step: string) => void;
  employees: BarberDetails[];
  employeesLoading: boolean;
  selectedBarber: string | undefined;
  setSelectedBarber: (id: string) => void;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  setSelectedTime: (time: string | undefined) => void;
  employeeWorkingHours: WorkingHours | null;
  customerDetails: CustomerDetails;
  handleCustomerDetailsChange: (field: keyof CustomerDetails, value: string) => void;
  totalPrice: number;
  language: string;
  branch: Branch;
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
  if (currentStep === 'services') {
    return (
      <ServiceStep
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
      <DateTimeStep
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    );
  }

  if (currentStep === 'barber') {
    return (
      <BarberStep
        employees={employees}
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
      <DetailsStep
        selectedServices={selectedServices}
        totalPrice={totalPrice}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        selectedBarberName={selectedBarber ? employees?.find(emp => emp.id === selectedBarber)?.[language === 'ar' ? 'name_ar' : 'name_en'] : undefined}
        customerDetails={customerDetails}
        onCustomerDetailsChange={handleCustomerDetailsChange}
        onRemoveService={(serviceId) => {
          const service = selectedServices.find(s => s.id === serviceId);
          if (service) {
            handleServiceToggle(service);
          }
        }}
        language={language}
        branch={branch}
      />
    );
  }

  return null;
};
