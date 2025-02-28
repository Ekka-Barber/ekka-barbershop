
import { BookingStep } from "./BookingProgress";
import { ServiceStep } from "./steps/ServiceStep";
import { DateTimeStep } from "./steps/DateTimeStep";
import { BarberStep } from "./steps/BarberStep";
import { CustomerStep } from "./steps/CustomerStep";
import { SummaryStep } from "./steps/SummaryStep";

interface BookingStepsProps {
  currentStep: BookingStep;
  onStepChange: (step: BookingStep) => void;
  selectedServices: any[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  selectedBarber: string | undefined;
  setSelectedBarber: (barber: string) => void;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  handleCustomerDetailsChange: (field: string, value: string) => void;
  categories: any[] | undefined;
  categoriesLoading: boolean;
  employees: any[] | undefined;
  employeesLoading: boolean;
  onServiceToggle: (service: any) => void;
  totalPrice: number;
  branch: any;
  branchId: string | null;
}

export const BookingSteps = ({
  currentStep,
  onStepChange,
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
  onServiceToggle,
  totalPrice,
  branch,
  branchId
}: BookingStepsProps) => {
  // Render different components based on the current step
  if (currentStep === "services") {
    return (
      <ServiceStep
        categories={categories}
        categoriesLoading={categoriesLoading}
        selectedServices={selectedServices}
        onServiceToggle={onServiceToggle}
        onStepChange={onStepChange}
        branchId={branchId}
      />
    );
  }

  if (currentStep === "datetime") {
    return (
      <DateTimeStep
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );
  }

  if (currentStep === "barber") {
    return (
      <BarberStep
        selectedBarber={selectedBarber}
        setSelectedBarber={setSelectedBarber}
        employees={employees}
        employeesLoading={employeesLoading}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
      />
    );
  }

  if (currentStep === "customer") {
    return (
      <CustomerStep
        customerDetails={customerDetails}
        handleCustomerDetailsChange={handleCustomerDetailsChange}
        branch={branch}
      />
    );
  }

  // Default to summary step
  return (
    <SummaryStep
      selectedServices={selectedServices}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarberName={employees?.find(emp => emp.id === selectedBarber)?.name}
      customerDetails={customerDetails}
      totalPrice={totalPrice}
      branch={branch}
    />
  );
};
