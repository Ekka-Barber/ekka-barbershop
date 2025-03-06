
import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { PackageSettings } from '@/types/admin';
import { Service, SelectedService } from '@/types/service';
import { PackageServiceList } from './PackageServiceList';
import { PackageSummary } from './PackageSummary';
import { useToast } from "@/hooks/use-toast";
import { X } from 'lucide-react';
import { transformServiceToSelected } from '@/utils/serviceTransformation';

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
  
  // Calculate discounts based on the number of selected add-ons
  const discountPercentage = useMemo(() => {
    if (!packageSettings) return 0;
    
    const count = selectedAddOns.length;
    if (count >= 3) {
      return packageSettings.discountTiers.threeOrMore;
    } else if (count === 2) {
      return packageSettings.discountTiers.twoServices;
    } else if (count === 1) {
      return packageSettings.discountTiers.oneService;
    }
    return 0;
  }, [selectedAddOns.length, packageSettings]);
  
  // Calculate total price and savings
  const calculations = useMemo(() => {
    // Start with base service if present
    let originalTotal = baseService?.price || 0;
    let discountedTotal = originalTotal;
    
    // Add all selected add-on services
    selectedAddOns.forEach(service => {
      originalTotal += service.price;
      // Apply discount to add-ons
      const discountedPrice = service.price * (1 - discountPercentage / 100);
      discountedTotal += Math.floor(discountedPrice);
    });
    
    return {
      originalTotal,
      discountedTotal,
      savings: originalTotal - discountedTotal,
      discountPercentage
    };
  }, [baseService, selectedAddOns, discountPercentage]);
  
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
      const discountedPrice = Math.floor(originalPrice * (1 - discountPercentage / 100));
      
      // Create a SelectedService object with discount information
      const selectedService: SelectedService = {
        ...service,
        price: discountedPrice,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        isUpsellItem: false
      };
      
      transformedServices.push(selectedService);
    });
    
    onConfirm(transformedServices);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'بناء باقتك' : 'Build Your Package'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'أضف خدمات إضافية للحصول على خصومات'
              : 'Add additional services to get discounts'}
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="mt-2 space-y-4">
          {baseService && (
            <div className="bg-muted/30 p-3 rounded-md border">
              <div className="text-sm font-medium mb-1">
                {language === 'ar' ? 'الخدمة الأساسية:' : 'Base Service:'}
              </div>
              <div className="flex justify-between items-center">
                <span>{language === 'ar' ? baseService.name_ar : baseService.name_en}</span>
                <span className="text-sm font-medium">
                  {language === 'ar' ? `${baseService.price} ر.س` : `SAR ${baseService.price}`}
                </span>
              </div>
            </div>
          )}
          
          <PackageServiceList 
            services={availableServices}
            selectedServices={selectedAddOns}
            onToggleService={toggleService}
            discountPercentage={discountPercentage}
            language={language}
          />
          
          <PackageSummary 
            originalTotal={calculations.originalTotal}
            discountedTotal={calculations.discountedTotal}
            savings={calculations.savings}
            language={language}
          />
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:mr-2"
          >
            {language === 'ar' ? 'تخطي' : 'Skip'}
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={selectedAddOns.length === 0 && !baseService}
          >
            {language === 'ar' ? 'تأكيد الباقة' : 'Confirm Package'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
