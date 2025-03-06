import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";
import { Service, SelectedService } from '@/types/service';
import { usePackageDiscount } from "@/hooks/usePackageDiscount";

interface UseServiceSelectionStateProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
  isUpdatingPackage?: boolean;
  handlePackageServiceUpdate?: (services: SelectedService[]) => void;
}

export const useServiceSelectionState = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  isUpdatingPackage = false,
  handlePackageServiceUpdate
}: UseServiceSelectionStateProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [pendingNextStep, setPendingNextStep] = useState<string | null>(null);

  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    packageSettings, 
    hasBaseService,
    enabledPackageServices
  } = usePackageDiscount(selectedServices, isUpdatingPackage);

  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

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

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
    }
  }, [activeCategory]);

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  const activeCategoryServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services.sort((a, b) => a.display_order - b.display_order);

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

  const displayServices = transformServicesForDisplay(selectedServices, language as 'en' | 'ar');

  return {
    activeCategory,
    activeCategoryServices,
    availablePackageServices: enabledPackageServices || [],
    baseService: selectedServices.find(s => 
      s.isBasePackageService || s.id === packageSettings?.baseServiceId
    ) || categories?.flatMap(c => c.services).find(s => s.id === packageSettings?.baseServiceId),
    displayServices: selectedServices,
    handlePackageConfirm,
    handleServiceClick: (service: any) => {
      setSelectedService(service);
      setIsSheetOpen(true);
    },
    handleServiceToggleWrapper: onServiceToggle,
    handleSkipPackage: () => {
      setShowPackageBuilder(false);
      if (pendingNextStep) {
        onStepChange?.(pendingNextStep);
        setPendingNextStep(null);
      }
    },
    handleStepChange: onStepChange,
    hasBaseService,
    isSheetOpen,
    packageEnabled,
    packageSettings,
    pendingNextStep,
    selectedService,
    setActiveCategory,
    setIsSheetOpen,
    setShowPackageBuilder,
    setShowPackageInfo,
    showPackageBuilder,
    showPackageInfo,
    sortedCategories,
    totalDuration,
    totalPrice,
  };
};
