
import { Suspense, lazy } from "react";
import { BookingStep } from "../BookingProgress";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerDetails } from "@/hooks/booking/useBookingState";

// Lazy load step components
const ServiceStep = lazy(() => import("./ServiceStep").then(module => ({ default: module.ServiceStep })));
const DateTimeStep = lazy(() => import("./DateTimeStep").then(module => ({ default: module.DateTimeStep })));
const BarberStep = lazy(() => import("./BarberStep"));
const CustomerStep = lazy(() => import("./CustomerStep"));
const SummaryStep = lazy(() => import("./SummaryStep").then(module => ({ default: module.SummaryStep })));

interface StepRendererProps {
  currentStep: BookingStep;
  // Service step props
  categories?: any[];
  categoriesLoading?: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange: (step: BookingStep) => void;
  branchId?: string;
  // DateTime step props
  selectedDate?: Date;
  setSelectedDate: (date: Date) => void;
  // Barber step props
  selectedBarber?: string;
  onBarberSelect: (barber: string) => void;
  employees?: any[];
  employeesLoading?: boolean;
  selectedTime?: string;
  setSelectedTime: (time: string) => void;
  // Customer step props
  customerDetails: CustomerDetails;
  onCustomerDetailsChange: (field: string, value: string) => void;
  // Shared props
  branch?: any;
  totalPrice: number;
}

const StepRenderer: React.FC<StepRendererProps> = (props) => {
  const {
    currentStep,
    categories,
    categoriesLoading,
    selectedServices,
    onServiceToggle,
    onStepChange,
    branchId,
    selectedDate,
    setSelectedDate,
    selectedBarber,
    onBarberSelect,
    employees,
    employeesLoading,
    selectedTime,
    setSelectedTime,
    customerDetails,
    onCustomerDetailsChange,
    branch,
    totalPrice
  } = props;

  // Fallback loading component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "services":
        return (
          <ServiceStep
            categories={categories || []}
            categoriesLoading={categoriesLoading || false}
            selectedServices={selectedServices}
            onServiceToggle={onServiceToggle}
            onStepChange={onStepChange}
            branchId={branchId}
          />
        );
      case "datetime":
        return (
          <DateTimeStep
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            branch={branch}
          />
        );
      case "barber":
        return (
          <BarberStep
            selectedBarber={selectedBarber}
            onBarberSelect={onBarberSelect}
            employees={employees || []}
            employeesLoading={employeesLoading || false}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        );
      case "customer":
        return (
          <CustomerStep
            customerDetails={customerDetails}
            onCustomerDetailsChange={onCustomerDetailsChange}
            branch={branch}
          />
        );
      case "summary":
        return (
          <SummaryStep
            selectedServices={selectedServices}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            selectedBarber={selectedBarber}
            customerDetails={customerDetails}
            totalPrice={totalPrice}
            branch={branch}
            employees={employees || []}
          />
        );
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      {renderCurrentStep()}
    </Suspense>
  );
};

export default StepRenderer;
