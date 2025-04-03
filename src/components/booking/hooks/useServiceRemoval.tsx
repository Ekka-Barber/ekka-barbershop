
import { useToast } from "@/hooks/use-toast";
import { SelectedService } from "@/types/service";

interface UseServiceRemovalProps {
  selectedServices: SelectedService[];
  setSelectedServices: (services: SelectedService[]) => void;
  BASE_SERVICE_ID: string;
  packageEnabled: boolean;
  applyPackageDiscounts: (services: SelectedService[]) => SelectedService[];
  toast: ReturnType<typeof useToast>['toast'];
  language: string;
}

export const useServiceRemoval = ({
  selectedServices,
  setSelectedServices,
  BASE_SERVICE_ID,
  packageEnabled,
  applyPackageDiscounts,
  toast,
  language
}: UseServiceRemovalProps) => {
  
  const handleServiceRemove = (serviceId: string) => {
    try {
      const serviceToRemove = selectedServices.find(s => s.id === serviceId);
      
      if (!serviceToRemove) {
        console.error('Service not found:', serviceId);
        return;
      }
      
      console.log('Removing service:', serviceId);
      
      setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
      
      const isPackageService = serviceToRemove.id === BASE_SERVICE_ID || 
                             serviceToRemove.isBasePackageService || 
                             serviceToRemove.isPackageAddOn;
      
      if (packageEnabled && isPackageService) {
        if (serviceToRemove.id === BASE_SERVICE_ID || serviceToRemove.isBasePackageService) {
          console.log('Removing base service - will disable package mode');
          setSelectedServices(selectedServices
            .filter(s => s.id !== serviceId)
            .map(s => {
              if (s.isPackageAddOn && s.originalPrice) {
                return {
                  ...s,
                  price: s.originalPrice,
                  isPackageAddOn: false,
                  discountPercentage: 0
                };
              }
              return s;
            }));
        } else {
          console.log('Removing package add-on service - will recalculate discounts');
          setTimeout(() => {
            const remainingServices = selectedServices.filter(s => s.id !== serviceId);
            const updatedServices = applyPackageDiscounts(remainingServices);
            if (updatedServices.length !== remainingServices.length) {
              console.error('Service count mismatch after discount recalculation');
            } else {
              setSelectedServices(updatedServices);
            }
          }, 50);
        }
      }
    } catch (error) {
      console.error('Error removing service:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar'
          ? 'حدث خطأ أثناء إزالة الخدمة. يرجى المحاولة مرة أخرى.'
          : 'An error occurred while removing the service. Please try again.',
        variant: "destructive"
      });
    }
  };

  return {
    handleServiceRemove
  };
};
