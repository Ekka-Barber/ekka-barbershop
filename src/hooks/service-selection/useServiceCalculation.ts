
import { SelectedService } from '@/types/service';

interface UseServiceCalculationProps {
  selectedServices: SelectedService[];
}

export const useServiceCalculation = ({ selectedServices }: UseServiceCalculationProps) => {
  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

  const transformServicesForDisplay = (services: SelectedService[], lang: 'en' | 'ar') => {
    return services.map(service => ({
      id: service.id,
      name: lang === 'ar' ? service.name_ar : service.name_en,
      price: service.price,
      duration: service.duration,
      originalPrice: service.originalPrice,
      isBasePackageService: service.isBasePackageService,
      isPackageAddOn: service.isPackageAddOn
    }));
  };

  return {
    totalDuration,
    totalPrice,
    transformServicesForDisplay
  };
};
