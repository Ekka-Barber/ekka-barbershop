
import { useState, useCallback } from 'react';
import { Service, ServiceViewState } from '@/types/service';
import { useTracking } from '@/hooks/useTracking';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export const useServiceManagement = (
  selectedServices: Service[],
  onServiceToggle: (service: Service) => void
) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { trackServiceInteraction } = useTracking();
  const [serviceState, setServiceState] = useState<ServiceViewState>({
    selected: null,
    isOpen: false,
    viewTime: Date.now(),
    viewTimes: {}
  });

  const handleServiceClick = useCallback(async (service: Service) => {
    const timestamp = Date.now();
    setServiceState(prev => ({
      selected: service,
      isOpen: true,
      viewTime: timestamp,
      viewTimes: { ...prev.viewTimes, [service.id]: timestamp }
    }));
    
    await trackServiceInteraction({
      category_id: service.category_id,
      service_id: service.id,
      interaction_type: 'service_view',
      discovery_path: [],
      selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
      price_viewed: true,
      description_viewed: false
    });
  }, [language, trackServiceInteraction]);

  const handleServiceToggleWrapper = useCallback(async (service: Service) => {
    try {
      const startTime = serviceState.viewTimes[service.id];
      const viewDuration = startTime ? Date.now() - startTime : 0;
      
      await trackServiceInteraction({
        category_id: service.category_id,
        service_id: service.id,
        interaction_type: 'service_selection',
        discovery_path: [],
        selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
        price_viewed: true,
        description_viewed: true,
        view_duration_seconds: Math.floor(viewDuration / 1000)
      });

      onServiceToggle(service);
      setServiceState(prev => ({
        ...prev,
        isOpen: false,
        selected: null,
        viewTimes: Object.fromEntries(
          Object.entries(prev.viewTimes).filter(([id]) => id !== service.id)
        )
      }));
    } catch (error) {
      console.error('Service toggle error:', error);
      toast({
        variant: "destructive",
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء إضافة/إزالة الخدمة. يرجى المحاولة مرة أخرى.'
          : 'There was an error adding/removing the service. Please try again.',
      });
    }
  }, [language, onServiceToggle, serviceState.viewTimes, toast, trackServiceInteraction]);

  return {
    serviceState,
    setServiceState,
    handleServiceClick,
    handleServiceToggleWrapper
  };
};
