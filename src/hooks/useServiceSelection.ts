
import { useState, useEffect } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { transformServiceToSelected, transformUpsellToSelected } from '@/utils/serviceTransformation';
import { usePackageDiscount } from '@/hooks/usePackageDiscount';

export const useServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // Use the package discount hook
  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    applyPackageDiscounts 
  } = usePackageDiscount(selectedServices);

  /**
   * Handles the toggling of a service selection
   */
  const handleServiceToggle = (service: Service | SelectedService, skipDiscountCalculation: boolean = false) => {
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
        // If removing the base package service, confirm with the user
        if (service.id === BASE_SERVICE_ID && packageEnabled) {
          const hasPackageServices = selectedServices.some(s => 
            s.id !== BASE_SERVICE_ID && !s.isUpsellItem
          );
          
          if (hasPackageServices) {
            toast({
              title: language === 'ar' ? 'تنبيه' : 'Warning',
              description: language === 'ar' 
                ? 'إزالة الخدمة الأساسية ستؤدي إلى فقدان خصومات الباقة'
                : 'Removing the base service will remove package discounts',
              variant: "destructive"
            });
          }
        }
        
        setSelectedServices(prev => prev.filter(s => s.id !== service.id));
      }
    } else {
      // Check if the service is already a SelectedService with discount info
      if ('originalPrice' in service || 'discountPercentage' in service) {
        // It's already a SelectedService with discount info, add it as is
        setSelectedServices(prev => [...prev, service as SelectedService]);
      } else {
        // Transform the regular Service into a SelectedService
        const transformedService = transformServiceToSelected(service as Service, skipDiscountCalculation);
        
        // Add the service to the selection
        setSelectedServices(prev => {
          const newServices = [...prev, transformedService];
          return newServices;
        });
      }
    }
  };

  /**
   * Adds upsell services to the selected services
   */
  const handleUpsellServiceAdd = (upsellServices: any[]) => {
    upsellServices.forEach(upsell => {
      const mainService = selectedServices.find(s => !s.isUpsellItem && s.id === upsell.mainServiceId);
      
      if (!mainService) {
        console.error('Main service not found for upsell:', upsell);
        return;
      }

      setSelectedServices(prev => {
        const newUpsell = transformUpsellToSelected(upsell, mainService.id);

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

  // Apply package discounts if applicable
  useEffect(() => {
    if (packageEnabled && selectedServices.length > 0) {
      const discountedServices = applyPackageDiscounts(selectedServices);
      // Only update if there's actually a change to avoid infinite loops
      const hasChanges = discountedServices.some((s, i) => 
        s.price !== selectedServices[i]?.price || 
        s.originalPrice !== selectedServices[i]?.originalPrice ||
        s.discountPercentage !== selectedServices[i]?.discountPercentage
      );
      
      if (hasChanges) {
        setSelectedServices(discountedServices);
      }
    }
  }, [packageEnabled, selectedServices.length]);

  return {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd
  };
};
