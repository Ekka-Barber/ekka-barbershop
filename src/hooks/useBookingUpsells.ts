
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SelectedService } from '@/types/service';

interface UpsellService {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  discount_percentage: number;
}

interface UseBookingUpsellsResult {
  upsellServices: UpsellService[];
  isLoading: boolean;
  error: Error | null;
  originalPrice: number;
  discountedPrice: number;
  calculateTotalSavings: () => number;
  calculatePercentageSaved: () => number;
}

export const useBookingUpsells = (
  selectedServiceIds: string[]
): UseBookingUpsellsResult => {
  const [upsellServices, setUpsellServices] = useState<UpsellService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUpsellServices = async () => {
      if (!selectedServiceIds.length) {
        setUpsellServices([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('service_upsells')
          .select(`
            id, 
            discount_percentage,
            upsell_service:upsell_service_id(id, name_en, name_ar, price, duration)
          `)
          .in('main_service_id', selectedServiceIds)
          .not('upsell_service_id', 'in', `(${selectedServiceIds.join(',')})`);

        if (fetchError) {
          throw new Error(fetchError.message);
        }

        // Transform the data into a flat structure
        const upsells = data.map((item) => {
          const service = item.upsell_service as any;
          return {
            id: service.id,
            name_en: service.name_en,
            name_ar: service.name_ar,
            price: service.price,
            duration: service.duration,
            discount_percentage: item.discount_percentage
          };
        });

        // Remove duplicates (if a service is an upsell for multiple selected services)
        const uniqueUpsells = Array.from(
          new Map(upsells.map(item => [item.id, item])).values()
        );

        setUpsellServices(uniqueUpsells);
      } catch (err) {
        console.error('Error fetching upsell services:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpsellServices();
  }, [selectedServiceIds]);

  const originalPrice = upsellServices.reduce(
    (total, service) => total + service.price,
    0
  );

  const discountedPrice = upsellServices.reduce(
    (total, service) => total + (service.price * (100 - service.discount_percentage) / 100),
    0
  );

  const calculateTotalSavings = () => {
    return originalPrice - discountedPrice;
  };

  const calculatePercentageSaved = () => {
    if (originalPrice === 0) return 0;
    return (calculateTotalSavings() / originalPrice) * 100;
  };

  return {
    upsellServices,
    isLoading,
    error,
    originalPrice,
    discountedPrice,
    calculateTotalSavings,
    calculatePercentageSaved
  };
};
