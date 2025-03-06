
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { PackageSettings } from '@/types/admin';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { createPackageService } from '@/utils/serviceTransformation';
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
  
  // Reset selected add-ons whenever the dialog opens or currently selected services change
  useEffect(() => {
    if (isOpen) {
      // Find currently selected non-base services that are eligible for the package
      const existingAddOns = currentlySelectedServices
        .filter(service => 
          service.id !== baseService?.id && 
          !service.isUpsellItem &&
          availableServices.some(s => s.id === service.id)
        )
        .map(service => 
          availableServices.find(s => s.id === service.id)
        )
        .filter(Boolean) as Service[];
      
      console.log('Found', existingAddOns.length, 'existing add-ons for package builder');
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
      if (!baseService) {
        console.error('Cannot confirm package: Base service is missing');
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' 
            ? 'الخدمة الأساسية مفقودة'
            : 'Base service is missing',
          variant: "destructive"
        });
        return;
      }
      
      const transformedServices: SelectedService[] = [];
      
      // ALWAYS add the base service first - critical for correct ordering
      console.log('Adding base service to package:', baseService.id, language === 'ar' ? baseService.name_ar : baseService.name_en);
      
      // Always ensure base service is created with proper flags
      const baseSelectedService = createPackageService(baseService, true);
      transformedServices.push(baseSelectedService);
      
      // Add selected add-on services with discounts
      selectedAddOns.forEach(service => {
        // Create package add-on with discount applied
        const packageAddOn = createPackageService(
          service, 
          false, 
          calculations.discountPercentage
        );
        
        transformedServices.push(packageAddOn);
      });

      // Log the complete package before confirming
      console.log('Confirming package with', transformedServices.length, 'services');
      console.log('Services being sent:', transformedServices.map(s => ({
        id: s.id,
        name: language === 'ar' ? s.name_ar : s.name_en,
        isBase: s.isBasePackageService,
        isAddOn: s.isPackageAddOn,
        originalPrice: s.originalPrice,
        finalPrice: s.price
      })));
      
      // Call the onConfirm handler with the complete list of services
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
        aria-describedby="package-builder-description"
      >
        <PackageBuilderHeader language={language} />
        
        <div id="package-builder-description" className="sr-only">
          {language === 'ar' 
            ? 'بناء باقة الخدمات الخاصة بك' 
            : 'Build your service package'}
        </div>
        
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
          isConfirmDisabled={!baseService} 
        />
      </DialogContent>
    </Dialog>
  );
};
