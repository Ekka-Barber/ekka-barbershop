
import { ServiceSelection } from "./ServiceSelection";
import { DateTimeSelection } from "./DateTimeSelection";
import { BarberSelection } from "./BarberSelection";
import { BookingSummary } from "./BookingSummary";
import { CustomerForm } from "./CustomerForm";
import { UpsellModal } from "./UpsellModal";
import { BookingStep } from "./BookingProgress";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";

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
  const { language } = useLanguage();
  const { upsellServices, showUpsell, hideUpsell, addUpsellServices } =
    useBookingUpsells(selectedServices);
  const [isUpsellShown, setIsUpsellShown] = useState(false);

  useEffect(() => {
    setIsUpsellShown(upsellServices.length > 0);
  }, [upsellServices]);

  const onMainServiceSelect = (service: any) => {
    onServiceToggle(service);
    showUpsell(service);
  };

  if (currentStep === "services") {
    return (
      <>
        <ServiceSelection
          categories={categories}
          isLoading={categoriesLoading}
          selectedServices={selectedServices}
          onServiceToggle={onMainServiceSelect}
          onStepChange={onStepChange}
          branchId={branchId || undefined}
        />
        <UpsellModal
          isOpen={isUpsellShown}
          upsellServices={upsellServices}
          selectedServices={selectedServices}
          onClose={hideUpsell}
          onAddUpsells={addUpsellServices}
        />
      </>
    );
  }

  if (currentStep === "datetime") {
    return (
      <DateTimeSelection
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    );
  }

  if (currentStep === "barber") {
    return (
      <BarberSelection
        selectedBarber={selectedBarber}
        onBarberSelect={setSelectedBarber}
        employees={employees}
        isLoading={employeesLoading}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        services={selectedServices}
      />
    );
  }

  if (currentStep === "customer") {
    return (
      <CustomerForm
        customerDetails={customerDetails}
        onInputChange={handleCustomerDetailsChange}
        branch={branch}
      />
    );
  }

  return (
    <BookingSummary
      selectedServices={selectedServices}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      selectedBarber={selectedBarber}
      customerDetails={customerDetails}
      totalPrice={totalPrice}
      branch={branch}
    />
  );
};
