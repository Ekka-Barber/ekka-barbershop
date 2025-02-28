
import React from "react";
import { ServiceStep } from "./ServiceStep";
import { DateTimeStep } from "./DateTimeStep";
import { BarberStep } from "./BarberStep";
import { CustomerStep } from "./CustomerStep";
import { SummaryStep } from "./SummaryStep";
import { BookingStep } from "../BookingProgress";

interface StepRendererProps {
  currentStep: BookingStep;
  // Services step
  categories: any[];
  categoriesLoading: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange: (step: BookingStep) => void;
  branchId: string | null;
  // DateTime step
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  // Barber step
  selectedBarber: string;
  onBarberSelect: (barberId: string) => void;
  employees: any[];
  employeesLoading: boolean;
  selectedTime: string;
  // Customer step
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  onCustomerDetailsChange: (field: string, value: string) => void;
  // Summary and other shared props
  branch: any;
  totalPrice: number;
}

const StepRenderer: React.FC<StepRendererProps> = ({
  currentStep,
  // Services step props
  categories,
  categoriesLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId,
  // DateTime step props
  selectedDate,
  setSelectedDate,
  // Barber step props
  selectedBarber,
  onBarberSelect,
  employees,
  employeesLoading,
  selectedTime,
  // Customer step props
  customerDetails,
  onCustomerDetailsChange,
  // Shared props
  branch,
  totalPrice
}) => {
  switch (currentStep) {
    case "services":
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
    case "datetime":
      return (
        <DateTimeStep
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
      );
    case "barber":
      return (
        <BarberStep
          selectedBarber={selectedBarber}
          onBarberSelect={onBarberSelect}
          employees={employees}
          isLoading={employeesLoading}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          services={selectedServices}
        />
      );
    case "customer":
      return (
        <CustomerStep
          customerDetails={customerDetails}
          handleCustomerDetailsChange={onCustomerDetailsChange}
          branch={branch}
        />
      );
    case "summary":
      return (
        <SummaryStep
          selectedServices={selectedServices}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          selectedBarberName={employees.find(e => e.id === selectedBarber)?.name || ""}
          customerDetails={customerDetails}
          totalPrice={totalPrice}
          branch={branch}
        />
      );
    default:
      return null;
  }
};

export default StepRenderer;
