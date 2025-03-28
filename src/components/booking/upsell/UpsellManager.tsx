
import { useState } from "react";
import { UpsellModal } from "@/components/booking/UpsellModal";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { useLanguage } from "@/contexts/LanguageContext";
import { useBookingContext } from "@/contexts/BookingContext";
import { BookingStep } from "@/components/booking/BookingProgress";

interface UpsellManagerProps {
  onStepChange: (step: BookingStep) => void;
}

export const UpsellManager = ({ onStepChange }: UpsellManagerProps) => {
  const { language } = useLanguage();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<BookingStep | null>(null);
  
  const {
    selectedServices,
    handleUpsellServiceAdd
  } = useBookingContext();

  const {
    data: availableUpsells
  } = useBookingUpsells(selectedServices, language);

  const initiateUpsellFlow = (nextStep: BookingStep) => {
    if (availableUpsells?.length) {
      setShowUpsellModal(true);
      setPendingStep(nextStep);
      return true;
    }
    return false;
  };

  const handleUpsellModalClose = () => {
    setShowUpsellModal(false);
    if (pendingStep) {
      onStepChange(pendingStep);
      setPendingStep(null);
    }
  };

  const handleUpsellConfirm = (selectedUpsells: any[]) => {
    handleUpsellServiceAdd(selectedUpsells);
    handleUpsellModalClose();
  };

  return (
    <>
      <UpsellModal 
        isOpen={showUpsellModal} 
        onClose={handleUpsellModalClose} 
        onConfirm={handleUpsellConfirm} 
        availableUpsells={availableUpsells || []} 
      />
      {/* Export the method so it can be called by a parent */}
      <div style={{ display: 'none' }} id="upsell-manager-api" data-initiate-flow={initiateUpsellFlow.toString()} />
    </>
  );
};
