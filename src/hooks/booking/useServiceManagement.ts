import { supabase } from "@/integrations/supabase/client";
import { useQuery } from '@tanstack/react-query';
import { Service, validateService } from '@/types/service';
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { SelectedService } from '@/types/service';

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
      
      return categories?.map(category => ({
        ...category,
        services: category.services
          .map(service => ({
            ...service,
            category_id: category.id
          }))
          .map(validateService)
          .filter(Boolean)
          .sort((a, b) => (a?.display_order || 0) - (b?.display_order || 0))
      }));
    },
  });

  const calculateDiscountedPrice = (service: Service) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    if (service.discount_type === 'percentage') {
      return service.price - (service.price * (service.discount_value / 100));
    } else {
      return service.price - service.discount_value;
    }
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

  const handleServiceToggle = (
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
  };

  return {
    categories,
    categoriesLoading,
    handleServiceToggle,
    calculateDiscountedPrice,
    roundPrice
  };
};
