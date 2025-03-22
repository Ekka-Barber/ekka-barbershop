
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

/**
 * Dialog component for building and customizing service packages
 * Allows users to select add-on services with automatic discount application
 *
 * @component
 */
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
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold leading-none tracking-tight text-center">
            {language === 'ar' ? "بناء باقة الخدمة" : "Build Service Package"}
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            {language === 'ar' 
              ? "اختر خدمات إضافية للحصول على خصم" 
              : "Select add-on services to get a discount"}
          </p>
        </div>
        
        <div id="package-builder-description" className="sr-only">
          {language === 'ar' 
            ? 'بناء باقة الخدمات الخاصة بك' 
            : 'Build your service package'}
        </div>
        
        <div className="mt-2 space-y-4">
          {/* Base Service Display */}
          {baseService && (
            <div className="rounded-md border p-3 bg-muted/30">
              <div className="flex items-start">
                <div className="p-1.5 bg-primary/10 rounded-md mr-3">
                  <Info className="h-4 w-4 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-medium text-sm flex justify-between">
                    <span>
                      {language === 'ar' 
                        ? "الخدمة الأساسية" 
                        : "Base Service"}
                    </span>
                    <span className="text-primary">
                      {baseService.price} {language === 'ar' ? "ريال" : "SAR"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? baseService.name_ar : baseService.name_en}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Add-on Services List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {language === 'ar' ? "الخدمات الإضافية" : "Add-on Services"}
            </h3>
            <div className="grid gap-2 max-h-52 overflow-y-auto pr-1">
              {availableServices.map((service) => {
                const isSelected = selectedAddOns.some((s) => s.id === service.id);
                
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-md border text-left transition-colors",
                      isSelected 
                        ? "bg-primary/5 border-primary/30" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center",
                        isSelected ? "bg-primary text-primary-foreground" : "border"
                      )}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {language === 'ar' ? service.name_ar : service.name_en}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} {language === 'ar' ? "دقيقة" : "min"}
                          </span>
                          <span className="flex items-center">
                            <CircleDollarSign className="h-3 w-3 mr-1" />
                            {isSelected ? (
                              <span className="flex items-center">
                                <span className="line-through mr-1 opacity-70">{service.price}</span>
                                <span className="text-primary">{Math.round(service.price * (1 - calculations.discountPercentage / 100))}</span>
                              </span>
                            ) : (
                              service.price
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
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
        
        <div className="flex justify-between gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {language === 'ar' ? "إلغاء" : "Cancel"}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!baseService}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {language === 'ar' ? "تأكيد الباقة" : "Confirm Package"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
