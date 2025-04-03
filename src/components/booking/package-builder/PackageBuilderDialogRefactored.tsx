
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { PackageSettings } from '@/types/admin';
import { Service, SelectedService } from '@/types/service';
import { useToast } from "@/hooks/use-toast";
import { createPackageService } from '@/utils/serviceTransformation';
import { usePackageCalculation } from '@/hooks/usePackageCalculation';
import { useNextTierCalculation } from '@/hooks/useNextTierCalculation';
import { PackageSummary } from './PackageSummary';
import { Button } from "@/components/ui/button";
import { X, Check, Info, CircleDollarSign, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";
import { BaseServiceDisplay } from './components/BaseServiceDisplay';
import { ServiceOptionsList } from './components/ServiceOptionsList';
import { PackageDialogHeader } from './components/PackageDialogHeader';
import { PackageDialogFooter } from './components/PackageDialogFooter';

export const PackageBuilderDialog = ({
  isOpen,
  onClose,
  onConfirm,
  packageSettings,
  baseService,
  availableServices,
  currentlySelectedServices
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedServices: SelectedService[]) => void;
  packageSettings?: PackageSettings;
  baseService: Service | null;
  availableServices: Service[];
  currentlySelectedServices: SelectedService[];
}) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedAddOns, setSelectedAddOns] = useState<Service[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
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
  
  // Use our hooks for calculations
  const calculations = usePackageCalculation(selectedAddOns, packageSettings, baseService);
  const nextTierThreshold = useNextTierCalculation(selectedAddOns.length, packageSettings);
  
  // Calculate total duration
  const totalDuration = [baseService, ...selectedAddOns].reduce(
    (total, service) => total + (service?.duration || 0),
    0
  );
  
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
      
      // Show a brief confirmation animation when service is added
      if (!isSelected) {
        setShowConfirmation(true);
        setTimeout(() => setShowConfirmation(false), 500);
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
      
      // Add the base service first
      const baseSelectedService = createPackageService(baseService, true);
      transformedServices.push(baseSelectedService);
      
      // Add selected add-on services with discounts
      selectedAddOns.forEach(service => {
        const packageAddOn = createPackageService(
          service, 
          false, 
          calculations.discountPercentage
        );
        
        transformedServices.push(packageAddOn);
      });

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
  
  // Map NextTierThreshold to the format expected by PackageSummary
  const mappedNextTierThreshold = nextTierThreshold ? {
    itemsUntilNextTier: nextTierThreshold.servicesNeeded,
    nextTierPercentage: nextTierThreshold.newPercentage
  } : undefined;
  
  const isRTL = language === 'ar';
  
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md overflow-visible" 
        onPointerDownOutside={(e) => e.preventDefault()}
        showCloseButton={false}
        aria-describedby="package-builder-description"
      >
        <PackageDialogHeader language={language} />
        
        <div id="package-builder-description" className="sr-only">
          {language === 'ar' 
            ? 'بناء باقة الخدمات الخاصة بك' 
            : 'Build your service package'}
        </div>
        
        <div className="mt-2 space-y-4">
          {/* Base Service Display */}
          {baseService && (
            <BaseServiceDisplay baseService={baseService} language={language} />
          )}
          
          {/* Add-on Services List */}
          <ServiceOptionsList 
            availableServices={availableServices}
            selectedAddOns={selectedAddOns}
            toggleService={toggleService}
            calculations={calculations}
            language={language}
          />
          
          <PackageSummary 
            originalTotal={calculations.originalTotal}
            discountedTotal={calculations.discountedTotal}
            savings={calculations.savings}
            language={language}
            discountPercentage={calculations.discountPercentage}
            nextTierThreshold={mappedNextTierThreshold}
            totalDuration={totalDuration}
          />
        </div>
        
        <PackageDialogFooter 
          onClose={onClose}
          handleConfirm={handleConfirm}
          baseService={baseService}
          language={language}
        />
      </DialogContent>
    </Dialog>
  );
};
