
import { useCallback } from 'react';
import { SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

export const usePackageServiceUpdate = (
  selectedServices: SelectedService[],
  setSelectedServices: React.Dispatch<React.SetStateAction<SelectedService[]>>,
  baseServiceId: string,
  setIsUpdatingPackage: React.Dispatch<React.SetStateAction<boolean>>,
  setForcePackageEnabled: (value: boolean) => void
) => {
  const { toast } = useToast();
  const { language } = useLanguage();

  /**
   * Safely update package services without removing the base service temporarily
   */
  const handlePackageServiceUpdate = useCallback((packageServices: SelectedService[]) => {
    try {
      if (!packageServices.length) {
        console.error('No package services provided for update');
        return;
      }

      // Set flag to prevent disabling package mode during update
      setIsUpdatingPackage(true);
      setForcePackageEnabled(true);
      
      console.log('🔄 Starting package update with', packageServices.length, 'services');
      
      // Validate that we have a base service in the package
      const baseService = packageServices.find(s => s.isBasePackageService || s.id === baseServiceId);
      if (!baseService) {
        throw new Error('No base service found in package services');
      }
      
      // Extract existing upsell items to preserve them
      const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
      
      // Update selected services in a single state update to prevent flickering
      setSelectedServices(prevServices => {
        // First, remove all non-upsell services
        const withoutNonUpsells = prevServices.filter(s => s.isUpsellItem);
        
        // Add the base service first (VERY IMPORTANT)
        const withBaseService = [...withoutNonUpsells, baseService];
        
        // Then add all other package services
        const otherPackageServices = packageServices.filter(s => 
          !s.isBasePackageService && s.id !== baseServiceId
        );
        
        return [...withBaseService, ...otherPackageServices];
      });

      console.log('✅ Package services updated successfully');
    } catch (error) {
      console.error('Error updating package services:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء تحديث الباقة'
          : 'An error occurred while updating the package',
        variant: "destructive"
      });
    } finally {
      // Reset flags after a short delay to ensure state has settled
      setTimeout(() => {
        setIsUpdatingPackage(false);
        setForcePackageEnabled(false);
      }, 500);
    }
  }, [baseServiceId, selectedServices, language, toast, setSelectedServices, setIsUpdatingPackage, setForcePackageEnabled]);

  /**
   * Adds upsell services to the selected services
   */
  const handleUpsellServiceAdd = useCallback((upsellServices: any[]) => {
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
  }, [selectedServices, setSelectedServices]);

  return {
    handlePackageServiceUpdate,
    handleUpsellServiceAdd
  };
};
