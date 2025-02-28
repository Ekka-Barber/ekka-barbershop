
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
  const { data: upsellData, isLoading: upsellLoading } = useBookingUpsells(selectedServices, language as 'en' | 'ar');
  const [isUpsellShown, setIsUpsellShown] = useState(false);
  const [currentUpsells, setCurrentUpsells] = useState<any[]>([]);

  // Handle showing/hiding upsell modal
  const showUpsell = (service: any) => {
    if (upsellData && upsellData.length > 0) {
      setCurrentUpsells(upsellData);
      setIsUpsellShown(true);
    }
  };

  const hideUpsell = () => {
    setIsUpsellShown(false);
    setCurrentUpsells([]);
  };

  const addUpsellServices = (selectedUpsells: any[]) => {
    // Add the selected upsell services
    selectedUpsells.forEach(upsell => {
      if (!selectedServices.some(s => s.id === upsell.id)) {
        onServiceToggle({
          ...upsell,
          isUpsellItem: true,
          originalPrice: upsell.price,
          price: upsell.discountedPrice,
          discountPercentage: upsell.discountPercentage
        });
      }
    });
  };

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
          availableUpsells={currentUpsells}
          selectedServices={selectedServices}
          onClose={hideUpsell}
          onConfirm={addUpsellServices}
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
        onTimeSelect={setSelectedTime}
      />
    );
  }

  if (currentStep === "customer") {
    return (
      <CustomerForm
        customerDetails={customerDetails}
        onCustomerDetailsChange={handleCustomerDetailsChange}
        branch={branch}
      />
    );
  }

  return (
    <BookingSummary
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
