
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { SelectedService } from '@/types/service';

export const useBookingUpsells = (selectedServices: SelectedService[], language: 'en' | 'ar') => {
  return useQuery({
    queryKey: ['upsells', selectedServices.map(s => s.id)],
    queryFn: async () => {
      if (selectedServices.length === 0) return [];
      
      const { data, error } = await supabase
        .from('service_upsells')
        .select(`
          upsell_service_id,
          discount_percentage,
          upsell:services!service_upsells_upsell_service_id_fkey (
            id,
            name_en,
            name_ar,
            price,
            duration
          )
        `)
        .in('main_service_id', selectedServices.map(s => s.id));

      if (error) throw error;

      // Create a map to store unique upsells with their lowest discount percentage
      const upsellMap = new Map();

      data.forEach(upsell => {
        const existingUpsell = upsellMap.get(upsell.upsell.id);
        
        if (!existingUpsell || upsell.discount_percentage < existingUpsell.discountPercentage) {
          upsellMap.set(upsell.upsell.id, {
            id: upsell.upsell.id,
            name_en: upsell.upsell.name_en,
            name_ar: upsell.upsell.name_ar,
            price: upsell.upsell.price,
            duration: upsell.upsell.duration,
            discountPercentage: upsell.discount_percentage
          });
        }
      });

      // Convert to array and format as SelectedService type
      return Array.from(upsellMap.values()).map(upsell => ({
        id: upsell.id,
        name_en: upsell.name_en,
        name_ar: upsell.name_ar,
        price: upsell.price,
        duration: upsell.duration,
        // Mark as upsell item for removal functionality
        isUpsellItem: true,
        // Calculate discounted price based on percentage
        originalPrice: upsell.price,
        price: upsell.price * (1 - upsell.discountPercentage / 100)
      }));
    },
    enabled: selectedServices.length > 0
  });
};
