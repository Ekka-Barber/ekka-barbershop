
import { useState, useCallback } from 'react';
import { Service, ServiceViewState } from '@/types/service';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export const useServiceManagement = (
  selectedServices: Service[],
  onServiceToggle: (service: Service) => void
) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [serviceState, setServiceState] = useState<ServiceViewState>({
    selected: null,
    isOpen: false,
    viewTime: Date.now(),
    viewTimes: {}
  });

  const handleServiceClick = useCallback((service: Service) => {
    const timestamp = Date.now();
    setServiceState(prev => ({
      selected: service,
      isOpen: true,
      viewTime: timestamp,
      viewTimes: { ...prev.viewTimes, [service.id]: timestamp }
    }));
  }, []);

  const handleServiceToggleWrapper = useCallback(async (service: Service) => {
    try {
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
        description: language === 'ar' 
          ? 'حدث خطأ أثناء إضافة/إزالة الخدمة. يرجى المحاولة مرة أخرى.'
          : 'There was an error adding/removing the service. Please try again.',
        variant: "destructive"
      });
    }
  }, [language, onServiceToggle, toast]);

  return {
    serviceState,
    setServiceState,
    handleServiceClick,
    handleServiceToggleWrapper
  };
};
