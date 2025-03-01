
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { SelectedService } from '@/types/service';
import { useMemo } from 'react';

export interface UpsellService {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  discountPercentage: number;
  discountedPrice: number;
  mainServiceId: string;
}

export const useBookingUpsells = (selectedServices: SelectedService[], language: 'en' | 'ar') => {
  // Get only the IDs for the query key to prevent unnecessary refetches
  const selectedServiceIds = useMemo(() => 
    selectedServices.filter(s => !s.isUpsellItem).map(s => s.id),
    [selectedServices]
  );

  return useQuery({
    queryKey: ['upsells', selectedServiceIds],
    queryFn: async () => {
      if (selectedServiceIds.length === 0) return [];
      
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
        .in('main_service_id', selectedServiceIds);

      if (error) throw error;

      // Create a map to store unique upsells with their lowest discount percentage
      const upsellMap = new Map();

      data.forEach(upsell => {
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
            mainServiceId: upsell.main_service_id
          });
        }
      });

      return Array.from(upsellMap.values());
    },
    enabled: selectedServiceIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
