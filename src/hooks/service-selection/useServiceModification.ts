
import { useCallback } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { transformServiceToSelected, transformUpsellToSelected } from '@/utils/serviceTransformation';

export const useServiceModification = (
  selectedServices: SelectedService[],
  setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>,
  baseServiceId: string,
  packageEnabled: boolean,
  isUpdatingPackage: boolean
) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  /**
   * Removes a service from the selected services
   */
  const removeService = useCallback((service: Service | SelectedService) => {
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
      // If removing the base package service, confirm with the user
      if (service.id === baseServiceId && packageEnabled) {
        const hasPackageServices = selectedServices.some(s => 
          s.id !== baseServiceId && !s.isUpsellItem
        );
        
        if (hasPackageServices) {
          toast({
            title: language === 'ar' ? 'تنبيه' : 'Warning',
            description: language === 'ar' 
              ? 'إزالة الخدمة الأساسية ستؤدي إلى فقدان خصومات الباقة'
              : 'Removing the base service will remove package discounts',
            variant: "destructive"
          });
          
          // When removing the base service, we also need to remove discounts from add-on services
          setSelectedServices(prev => {
            const updatedServices = prev.filter(s => s.id !== service.id).map(s => {
              // Reset prices for package add-ons
              if (s.isPackageAddOn && s.originalPrice) {
                return {
                  ...s,
                  price: s.originalPrice,
                  isPackageAddOn: false,
                  discountPercentage: 0
                };
              }
              return s;
            });
            
            return updatedServices;
          });
          return;
        }
      }
      
      setSelectedServices(prev => prev.filter(s => s.id !== service.id));
    }
  }, [selectedServices, baseServiceId, packageEnabled, language, toast, setSelectedServices]);

  /**
   * Adds a service to the selected services
   */
  const addService = useCallback((service: Service | SelectedService, skipDiscountCalculation: boolean = false) => {
    // Check if trying to add the base service when other services are already selected
    if (service.id === baseServiceId) {
      const hasOtherNonUpsellServices = selectedServices.some(s => 
        !s.isUpsellItem && s.id !== baseServiceId
      );
      
      if (hasOtherNonUpsellServices) {
        toast({
          title: language === 'ar' ? 'غير مسموح' : 'Not Allowed',
          description: language === 'ar' 
            ? 'يجب إختيار خدمة الباقة الأساسية أولاً قبل إضافة خدمات أخرى'
            : 'You must select the base package service first before adding other services',
          variant: "destructive"
        });
        return;
      }
    }
    
    // Check if it's a package service (has package-specific properties)
    if ('isBasePackageService' in service || 'isPackageAddOn' in service) {
      console.log('Adding pre-configured package service:', service.id, service.isBasePackageService ? 'BASE' : 'ADD-ON');
      setSelectedServices(prev => [...prev, service as SelectedService]);
      return;
    }
    
    // Check if it's already a SelectedService with discount info
    if ('originalPrice' in service || 'discountPercentage' in service) {
      // It's already a SelectedService with discount info, add it as is
      setSelectedServices(prev => [...prev, service as SelectedService]);
    } else {
      // Determine if this is the base package service
      const isBasePackageService = service.id === baseServiceId;
      
      // Transform the regular Service into a SelectedService
      const transformedService = transformServiceToSelected(
        service as Service, 
        skipDiscountCalculation,
        isBasePackageService
      );
      
      console.log('Adding transformed service:', transformedService.id, 
        isBasePackageService ? '(base service)' : '');
      
      // Add the service to the selection
      setSelectedServices(prev => {
        const newServices = [...prev, transformedService];
        return newServices;
      });
    }
  }, [baseServiceId, selectedServices, language, toast, setSelectedServices]);

  return {
    removeService,
    addService
  };
};
