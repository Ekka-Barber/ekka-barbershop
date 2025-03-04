
import { useState } from 'react';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { transformServiceToSelected, transformUpsellToSelected } from '@/utils/serviceTransformation';

export const useServiceSelection = () => {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const { toast } = useToast();
  const { language } = useLanguage();

  /**
   * Handles the toggling of a service selection
   */
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
      const transformedService = transformServiceToSelected(service, skipDiscountCalculation);
      setSelectedServices(prev => [...prev, transformedService]);
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

  return {
    selectedServices,
    setSelectedServices,
    handleServiceToggle,
    handleUpsellServiceAdd
  };
};
