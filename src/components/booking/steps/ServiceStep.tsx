
import { UpsellModal } from "../UpsellModal";
import { ServiceSelection } from "../ServiceSelection";
import { useState } from "react";
import { useBookingUpsells } from "@/hooks/useBookingUpsells";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingStep } from "../BookingProgress";

interface ServiceStepProps {
  categories: any[] | undefined;
  categoriesLoading: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange: (step: BookingStep) => void;
  branchId: string | null;
}

export const ServiceStep = ({
  categories,
  categoriesLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId
}: ServiceStepProps) => {
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
};
