
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
  
  // Reset selections when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Initialize with add-ons that are already selected in the main interface
      const existingAddOns = currentlySelectedServices.filter(
        service => service.id !== baseService?.id && !service.isUpsellItem
      ).map(service => availableServices.find(s => s.id === service.id)).filter(Boolean) as Service[];
      
      setSelectedAddOns(existingAddOns);
    }
  }, [isOpen, baseService, availableServices, currentlySelectedServices]);
  
  // Use the package calculation hook
  const calculations = usePackageCalculation(selectedAddOns, packageSettings, baseService);
  
  // Toggle service selection
  const toggleService = (service: Service) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(s => s.id === service.id);
      
      // Check if we've reached the max services limit
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
    // Transform services to SelectedService with discount information
    const transformedServices: SelectedService[] = [];
    
    // Add base service if present
    if (baseService) {
      // Mark the base service as the base package service
      const baseSelectedService = transformServiceToSelected(baseService, true);
      transformedServices.push(baseSelectedService);
    }
    
    // Add selected add-ons with discount info
    selectedAddOns.forEach(service => {
      const originalPrice = service.price;
      const discountedPrice = Math.floor(originalPrice * (1 - calculations.discountPercentage / 100));
      
      // Create a SelectedService object with discount information
      const selectedService: SelectedService = {
        ...service,
        price: discountedPrice,
        originalPrice: originalPrice,
        discountPercentage: calculations.discountPercentage,
        isUpsellItem: false
      };
      
      transformedServices.push(selectedService);
    });
    
    onConfirm(transformedServices);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <PackageBuilderHeader language={language} onClose={onClose} />
        
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
          isConfirmDisabled={selectedAddOns.length === 0 && !baseService}
        />
      </DialogContent>
    </Dialog>
  );
};
