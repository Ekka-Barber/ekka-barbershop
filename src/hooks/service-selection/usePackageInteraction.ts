
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from '@/types/service';

interface UsePackageInteractionProps {
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
  selectedServices: SelectedService[];
  BASE_SERVICE_ID: string;
}

export const usePackageInteraction = ({
  onServiceToggle,
  onStepChange,
  handlePackageServiceUpdate,
  selectedServices,
  BASE_SERVICE_ID
}: UsePackageInteractionProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<string | null>(null);

  const handleServiceToggleWrapper = (service: any) => {
    try {
      if (service.id === BASE_SERVICE_ID && !selectedServices.some(s => s.id === service.id)) {
        const hasOtherNonUpsellServices = selectedServices.some(s => 
          !s.isUpsellItem && s.id !== BASE_SERVICE_ID
        );
        
        if (hasOtherNonUpsellServices) {
          toast({
            variant: "destructive",
            title: language === 'ar' ? 'غير مسموح' : 'Not Allowed',
            description: language === 'ar' 
              ? 'يجب إختيار خدمة الباقة الأساسية أولاً قبل إضافة خدمات أخرى'
              : 'You must select the base package service first before adding other services',
          });
          return;
        }
      }
      
      onServiceToggle(service);
    } catch (error) {
      toast({
        variant: "destructive",
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء إضافة/إزالة الخدمة. يرجى المحاولة مرة أخرى.'
          : 'There was an error adding/removing the service. Please try again.',
      });
      console.error('Service toggle error:', error);
    }
  };
  
  const handlePackageConfirm = (services: SelectedService[]) => {
    try {
      // First, ensure we have the base service
      const baseServiceFromPackage = services.find(s => s.isBasePackageService || s.id === BASE_SERVICE_ID);
      if (!baseServiceFromPackage) {
        console.error('No base service found in package confirmation');
        toast({
          variant: "destructive",
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' 
            ? 'لم يتم العثور على الخدمة الأساسية في الباقة'
            : 'Base service not found in the package',
        });
        return;
      }
      
      // Using the new streamlined package update function if available
      if (handlePackageServiceUpdate) {
        console.log('Using optimized package update flow');
        handlePackageServiceUpdate(services);
        
        // Close dialog and proceed if needed
        setShowPackageBuilder(false);
        if (pendingNextStep) {
          onStepChange?.(pendingNextStep);
          setPendingNextStep(null);
        }
        return;
      }
      
      // Legacy approach - less optimized but works as fallback
      console.log('Using legacy package update flow');
      
      // Extract existing upsell items to preserve them
      const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
      
      // First, remove all current non-upsell services
      const nonUpsellServices = selectedServices.filter(s => !s.isUpsellItem);
      for (const service of nonUpsellServices) {
        handleServiceToggleWrapper(service);
      }
      
      // Important: Add services in a staggered way to ensure proper processing
      setTimeout(() => {
        // First pass: add the base service
        console.log('First pass: Adding base service:', baseServiceFromPackage.id);
        handleServiceToggleWrapper(baseServiceFromPackage);
        
        // Second pass: add all add-on services
        setTimeout(() => {
          const addOnServices = services.filter(s => 
            !s.isBasePackageService && s.id !== BASE_SERVICE_ID
          );
          
          console.log('Second pass: Adding', addOnServices.length, 'add-on services');
          for (const service of addOnServices) {
            handleServiceToggleWrapper(service);
          }
          
          // Third pass: restore any upsells
          setTimeout(() => {
            console.log('Third pass: Restoring', existingUpsells.length, 'upsells');
            for (const upsell of existingUpsells) {
              if (!selectedServices.some(s => s.id === upsell.id)) {
                onServiceToggle(upsell);
              }
            }
            
            // Finally, close dialog and proceed if needed
            setShowPackageBuilder(false);
            if (pendingNextStep) {
              console.log('Proceeding to next step:', pendingNextStep);
              onStepChange?.(pendingNextStep);
              setPendingNextStep(null);
            }
          }, 100);
        }, 100);
      }, 100);
    } catch (error) {
      console.error('Error confirming package:', error);
      toast({
        variant: "destructive",
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' 
          ? 'حدث خطأ أثناء تأكيد الباقة. يرجى المحاولة مرة أخرى.'
          : 'There was an error confirming the package. Please try again.',
      });
    }
  };

  const handleSkipPackage = () => {
    setShowPackageBuilder(false);
    if (pendingNextStep) {
      onStepChange?.(pendingNextStep);
      setPendingNextStep(null);
    }
  };

  return {
    showPackageInfo,
    setShowPackageInfo,
    showPackageBuilder,
    setShowPackageBuilder,
    pendingNextStep,
    setPendingNextStep,
    handleServiceToggleWrapper,
    handlePackageConfirm,
    handleSkipPackage
  };
};
