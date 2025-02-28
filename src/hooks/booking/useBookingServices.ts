
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Service, SelectedService, Category } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const useBookingServices = (
  selectedServices: SelectedService[], 
  setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>,
  branchId?: string | null
) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  console.log('useBookingServices called with branchId:', branchId);

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['service_categories', branchId],
    queryFn: async () => {
      console.log('Fetching categories with branchId:', branchId);
      
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
      
      console.log('Raw categories data:', categories);
      
      let serviceAvailability = {};
      if (branchId) {
        const { data: availabilityData, error: availabilityError } = await supabase
          .from('service_branch_availability')
          .select('service_id, is_available')
          .eq('branch_id', branchId);
          
        if (availabilityError) {
          console.error('Error fetching service availability:', availabilityError);
        } else if (availabilityData) {
          serviceAvailability = availabilityData.reduce((acc, item) => {
            acc[item.service_id] = item.is_available;
            return acc;
          }, {});
          
          console.log('Service availability data:', serviceAvailability);
        }
      }
      
      const processedCategories = categories?.map(category => {
        const filteredServices = (category.services || [])
          .map(service => ({
            ...service,
            category_id: category.id
          }))
          .map(validateService)
          .filter(Boolean)
          .filter(service => {
            if (branchId) {
              return serviceAvailability[service.id] !== false;
            }
            return true;
          })
          .sort((a, b) => (a?.display_order || 0) - (b?.display_order || 0));

        return {
          ...category,
          services: filteredServices
        };
      }) as Category[];

      console.log('Processed categories:', processedCategories);
      
      return processedCategories;
    },
    enabled: branchId !== undefined && branchId !== null,
    staleTime: 5 * 60 * 1000
  });

  // Handle error logging separately
  if (categoriesError) {
    console.error('Error in categories query:', categoriesError);
  }

  const validateService = (service: any): Service | null => {
    try {
      if (!service?.id || !service?.name_en || !service?.name_ar || 
          typeof service?.price !== 'number' || typeof service?.duration !== 'number' ||
          typeof service?.display_order !== 'number') {
        console.warn('Invalid service data:', service);
        return null;
      }
  
      return {
        id: service.id,
        name_en: service.name_en,
        name_ar: service.name_ar,
        description_en: service.description_en || null,
        description_ar: service.description_ar || null,
        price: service.price,
        duration: service.duration,
        category_id: service.category_id || '',
        display_order: service.display_order,
        discount_type: service.discount_type || undefined,
        discount_value: service.discount_value || undefined
      };
    } catch (error) {
      console.error('Error validating service:', error);
      return null;
    }
  };

  const handleServiceToggle = (service: Service, skipDiscountCalculation: boolean = false) => {
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
        
        setSelectedServices(prev => prev.filter(s => 
          s.id !== service.id && s.mainServiceId !== service.id
        ));
      } else {
        setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      }
    } else {
      const finalPrice = skipDiscountCalculation ? service.price : calculateDiscountedPrice(service);
      setSelectedServices(prev => [...prev, {
        ...service,
        price: roundPrice(finalPrice),
        originalPrice: skipDiscountCalculation ? undefined : (finalPrice !== service.price ? roundPrice(service.price) : undefined),
        isUpsellItem: false,
        dependentUpsells: []
      }]);
    }
  };

  const calculateDiscountedPrice = (service: any) => {
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

  return {
    categories,
    categoriesLoading,
    categoriesError,
    handleServiceToggle,
    calculateDiscountedPrice,
    roundPrice
  };
};
