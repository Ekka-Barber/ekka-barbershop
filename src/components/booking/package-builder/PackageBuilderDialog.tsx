
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { PackageSettings } from '@/types/admin';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { transformServiceToSelected } from '@/utils/serviceTransformation';
import { PackageBuilderHeader } from './PackageBuilderHeader';
import { BaseServiceDisplay } from './BaseServiceDisplay';
import { PackageServiceList } from './PackageServiceList';
import { PackageSummary } from './PackageSummary';
import { PackageBuilderFooter } from './PackageBuilderFooter';
import { usePackageCalculation } from '@/hooks/usePackageCalculation';

interface PackageBuilderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedServices: SelectedService[]) => void;
  packageSettings?: PackageSettings;
  baseService: Service | null;
  availableServices: Service[];
  currentlySelectedServices: SelectedService[];
}

export const PackageBuilderDialog = ({
  isOpen,
  onClose,
  onConfirm,
  packageSettings,
  baseService,
  availableServices,
  currentlySelectedServices
}: PackageBuilderDialogProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedAddOns, setSelectedAddOns] = useState<Service[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      const existingAddOns = currentlySelectedServices.filter(
        service => service.id !== baseService?.id && !service.isUpsellItem
      ).map(service => availableServices.find(s => s.id === service.id)).filter(Boolean) as Service[];
      
      setSelectedAddOns(existingAddOns);
    }
  }, [isOpen, baseService, availableServices, currentlySelectedServices]);
  
  const calculations = usePackageCalculation(selectedAddOns, packageSettings, baseService);
  
  const toggleService = (service: Service) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      
      if (!isSelected && packageSettings?.maxServices && 
          prev.length >= packageSettings.maxServices) {
        toast({
          title: language === 'ar' 
            ? 'تم الوصول إلى الحد الأقصى للخدمات' 
            : 'Maximum services limit reached',
          description: language === 'ar'
            ? `يمكنك إضافة ${packageSettings.maxServices} خدمات كحد أقصى`
            : `You can add a maximum of ${packageSettings.maxServices} services to your package`,
          variant: "destructive"
        });
        return prev;
      }
      
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };
  
  const handleConfirm = () => {
    try {
      const transformedServices: SelectedService[] = [];
      
      // Always add the base service if present
      if (baseService) {
        console.log('Adding base service to package:', baseService.id, language === 'ar' ? baseService.name_ar : baseService.name_en);
        const baseSelectedService = transformServiceToSelected(baseService, true);
        transformedServices.push(baseSelectedService);
      } else {
        console.error('No base service available for package');
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' 
            ? 'لا توجد خدمة أساسية متاحة للباقة'
            : 'No base service available for package',
          variant: "destructive"
        });
        return;
      }
      
      // Add selected add-on services with discounts
      selectedAddOns.forEach(service => {
        const originalPrice = service.price;
        const discountedPrice = Math.floor(originalPrice * (1 - calculations.discountPercentage / 100));
        
        const selectedService: SelectedService = {
          ...service,
          price: discountedPrice,
          originalPrice: originalPrice,
          discountPercentage: calculations.discountPercentage,
          isUpsellItem: false
        };
        
        transformedServices.push(selectedService);
      });

      // Call the onConfirm handler with the complete list of services
      console.log('Confirming package with', transformedServices.length, 'services');
      onConfirm(transformedServices);
    } catch (error) {
      console.error('Error confirming package:', error);
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء تأكيد الباقة' 
          : 'An error occurred while confirming the package',
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
      >
        <PackageBuilderHeader language={language} />
        
        <div className="mt-2 space-y-4">
          <BaseServiceDisplay baseService={baseService} language={language} />
          
          <PackageServiceList 
            services={availableServices}
            selectedServices={selectedAddOns}
            onToggleService={toggleService}
            discountPercentage={calculations.discountPercentage}
            language={language}
          />
          
          <PackageSummary 
            originalTotal={calculations.originalTotal}
            discountedTotal={calculations.discountedTotal}
            savings={calculations.savings}
            language={language}
          />
        </div>
        
        <PackageBuilderFooter 
          language={language}
          onClose={onClose}
          onConfirm={handleConfirm}
          isConfirmDisabled={!baseService} // Changed to only disable if no base service
        />
      </DialogContent>
    </Dialog>
  );
};
