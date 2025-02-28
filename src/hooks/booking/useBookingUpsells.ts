
import { SelectedService } from '@/types/service';

export const useBookingUpsells = (selectedServices: SelectedService[], setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>) => {
  const handleUpsellServiceAdd = (upsellServices: any[]) => {
    upsellServices.forEach(upsell => {
      const mainService = selectedServices.find(s => !s.isUpsellItem && s.id === upsell.mainServiceId);
      
      if (!mainService) {
        console.error('Main service not found for upsell:', upsell);
        return;
      }

      setSelectedServices(prev => {
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

        const updatedServices = prev.map(s => {
          if (s.id === mainService.id) {
            return {
              ...s,
              dependentUpsells: [...(s.dependentUpsells || []), upsell.id]
            };
          }
          return s;
        });

        return [...updatedServices, newUpsell];
      });
    });
  };

  const roundPrice = (price: number) => {
    const decimal = price % 1;
    if (decimal >= 0.5) {
      return Math.ceil(price);
    } else if (decimal <= 0.4) {
      return Math.floor(price);
    }
    return price;
  };

  return {
    handleUpsellServiceAdd
  };
};
