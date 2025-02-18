
import { useState, useCallback, useMemo } from 'react';
import { Service, ServiceViewState } from '@/types/service';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';

export const useServiceManagement = (
  selectedServices: Service[],
  onServiceToggle: (service: Service) => void
) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // Memoize the initial state to prevent unnecessary recreations
  const initialState = useMemo<ServiceViewState>(() => ({
    selected: null,
    isOpen: false,
    viewTime: Date.now(),
    viewTimes: {}
  }), []);

  const [serviceState, setServiceState] = useState<ServiceViewState>(initialState);

  // Memoize the service selection state
  const selectionMap = useMemo(() => {
    return new Set(selectedServices.map(s => s.id));
  }, [selectedServices]);

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
      
      // Batch state updates
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

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    serviceState,
    setServiceState,
    handleServiceClick,
    handleServiceToggleWrapper,
    isServiceSelected: (id: string) => selectionMap.has(id)
  }), [serviceState, handleServiceClick, handleServiceToggleWrapper, selectionMap]);
};
