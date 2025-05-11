
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { SelectedService } from '@/types/service';

export interface UpsellService {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  discountPercentage: number;
  discountedPrice: number;
  mainServiceId: string; // Add this to track the main service
}

export const useBookingUpsells = (selectedServices: SelectedService[], language: 'en' | 'ar') => {
  return useQuery({
    queryKey: ['upsells', selectedServices.map(s => s.id)],
    queryFn: async () => {
      if (selectedServices.length === 0) return [];
      
      // Only get upsells for main services (non-upsell items)
      const mainServiceIds = selectedServices
        .filter(s => !s.isUpsellItem)
        .map(s => s.id);

      if (mainServiceIds.length === 0) return [];

      const { data, error } = await supabase
        .from('service_upsells')
        .select(`
          upsell_service_id,
          main_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (
            id,
            name_en,
            name_ar,
            price,
            duration
          )
        `)
        .in('main_service_id', mainServiceIds);

      if (error) throw error;

      // Create a map to store unique upsells with their lowest discount percentage
      const upsellMap = new Map();

      if (data && Array.isArray(data)) {
        data.forEach(upsell => {
          if (!upsell.upsell) return;
          
          const existingUpsell = upsellMap.get(upsell.upsell.id);
          
          if (!existingUpsell || upsell.discount_percentage < existingUpsell.discountPercentage) {
            const discountedPrice = upsell.upsell.price - (upsell.upsell.price * (upsell.discount_percentage / 100));
            
            upsellMap.set(upsell.upsell.id, {
              id: upsell.upsell.id,
              name_en: upsell.upsell.name_en,
              name_ar: upsell.upsell.name_ar,
              price: upsell.upsell.price,
              duration: upsell.upsell.duration,
              discountPercentage: upsell.discount_percentage,
              discountedPrice: discountedPrice,
              mainServiceId: upsell.main_service_id // Store the main service ID
            });
          }
        });
      }

      return Array.from(upsellMap.values());
    },
    enabled: selectedServices.length > 0
  });
};
