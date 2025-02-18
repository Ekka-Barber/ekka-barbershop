
import { SelectedService } from '@/types/service';
import { useServiceManagement } from './useServiceManagement';

export const useUpsellManagement = () => {
  const { roundPrice } = useServiceManagement();

  const handleUpsellServiceAdd = (
    upsellServices: any[],
    selectedServices: SelectedService[],
    setSelectedServices: (services: SelectedService[]) => void
  ) => {
    upsellServices.forEach(upsell => {
      const mainService = selectedServices.find(s => !s.isUpsellItem && s.id === upsell.mainServiceId);
      
      if (!mainService) {
        console.error('Main service not found for upsell:', upsell);
        return;
      }

      const updatedServices = selectedServices.map(s => {
        if (s.id === mainService.id) {
          return {
            ...s,
            dependentUpsells: [...(s.dependentUpsells || []), upsell.id]
          };
        }
        return s;
      });

      const newUpsell: SelectedService = {
        id: upsell.id,
        name_en: upsell.name_en,
        name_ar: upsell.name_ar,
        price: roundPrice(upsell.discountedPrice),
        duration: upsell.duration,
        category_id: '',
        display_order: 0,
        description_en: null,
        description_ar: null,
        discount_type: null,
        discount_value: null,
        originalPrice: roundPrice(upsell.price),
        discountPercentage: upsell.discountPercentage,
        isUpsellItem: true,
        mainServiceId: mainService.id
      };

      setSelectedServices([...updatedServices, newUpsell]);
    });
  };

  return {
    handleUpsellServiceAdd
  };
};
