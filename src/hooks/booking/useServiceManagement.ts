
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { Service, Category, validateService } from '@/types/service';
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SelectedService } from '@/types/service';
import { useMemo } from 'react';

export const useServiceManagement = () => {
  const { language } = useLanguage();
  const { toast } = useToast();

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          display_order,
          created_at,
          services (
            id,
            name_en,
            name_ar,
            description_en,
            description_ar,
            price,
            duration,
            category_id,
            display_order,
            discount_type,
            discount_value
          )
        `)
        .order('display_order', { ascending: true });
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      return categories as Category[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Memoize price calculations
  const calculateDiscountedPrice = useMemo(() => (service: Service) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    if (service.discount_type === 'percentage') {
      return service.price - (service.price * (service.discount_value / 100));
    } else {
      return service.price - service.discount_value;
    }
  }, []);

  const roundPrice = useMemo(() => (price: number) => {
    const decimal = price % 1;
    if (decimal >= 0.5) {
      return Math.ceil(price);
    } else if (decimal <= 0.4) {
      return Math.floor(price);
    }
    return price;
  }, []);

  const handleServiceToggle = useCallback((
    service: Service,
    selectedServices: SelectedService[],
    setSelectedServices: (services: SelectedService[]) => void,
    skipDiscountCalculation: boolean = false
  ) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    
    if (isSelected) {
      const hasUpsells = selectedServices.some(s => s.mainServiceId === service.id);
      
      if (hasUpsells) {
        toast({
          title: language === 'ar' ? 'تنبيه' : 'Warning',
          description: language === 'ar' 
            ? 'سيؤدي إزالة هذه الخدمة إلى إزالة الخدمات الإضافية المخفضة المرتبطة بها'
            : 'Removing this service will also remove its discounted add-on services',
          variant: "destructive"
        });
        
        // Batch update for better performance
        setSelectedServices(
          selectedServices.filter(s => s.id !== service.id && s.mainServiceId !== service.id)
        );
      } else {
        setSelectedServices(
          selectedServices.filter(s => s.id !== service.id)
        );
      }
    } else {
      const finalPrice = skipDiscountCalculation ? service.price : calculateDiscountedPrice(service);
      setSelectedServices([
        ...selectedServices,
        {
          ...service,
          price: roundPrice(finalPrice),
          originalPrice: skipDiscountCalculation ? undefined : (finalPrice !== service.price ? roundPrice(service.price) : undefined),
          isUpsellItem: false,
          dependentUpsells: []
        }
      ]);
    }
  }, [language, toast, calculateDiscountedPrice, roundPrice]);

  return {
    categories,
    categoriesLoading,
    handleServiceToggle,
    calculateDiscountedPrice,
    roundPrice
  };
};
