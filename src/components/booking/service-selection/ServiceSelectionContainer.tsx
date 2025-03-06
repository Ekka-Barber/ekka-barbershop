import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";
import { PackageBanner } from "./PackageBanner";
import { CategoryTabs } from "./CategoryTabs";
import { ServiceGrid } from "./ServiceGrid";
import { ServiceDetailSheet } from "./ServiceDetailSheet";
import { ServicesSummary } from "./ServicesSummary";
import { PackageInfoDialog } from "./PackageInfoDialog";
import { PackageBuilderDialog } from "../package-builder/PackageBuilderDialog";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { Service, SelectedService } from "@/types/service";

interface ServiceSelectionContainerProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
}

export const ServiceSelectionContainer = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceSelectionContainerProps) => {
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
  } = usePackageDiscount(selectedServices);

  const baseService = selectedServices.find(s => s.id === BASE_SERVICE_ID) || 
    (categories?.flatMap(c => c.services).find(s => s.id === BASE_SERVICE_ID));

  const availablePackageServices = categories?.flatMap(c => c.services)
    .filter(service => 
      service.id !== BASE_SERVICE_ID && 
      enabledPackageServices?.includes(service.id)
    ) || [];

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
    }
  }, [activeCategory]);

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
      const existingUpsells = selectedServices.filter(s => s.isUpsellItem);
      
      selectedServices.forEach(service => {
        if (!service.isUpsellItem) {
          handleServiceToggleWrapper(service);
        }
      });
      
      services.forEach(service => {
        onServiceToggle(service);
      });
      
      existingUpsells.forEach(upsell => {
        if (!selectedServices.some(s => s.id === upsell.id)) {
          onServiceToggle(upsell);
        }
      });
      
      setShowPackageBuilder(false);
      
      if (pendingNextStep) {
        onStepChange?.(pendingNextStep);
        setPendingNextStep(null);
      }
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

  const handleStepChange = (nextStep: string) => {
    if (nextStep === 'datetime' && hasBaseService && packageSettings && availablePackageServices.length > 0) {
      setShowPackageBuilder(true);
      setPendingNextStep(nextStep);
    } else {
      onStepChange?.(nextStep);
    }
  };

  const handleSkipPackage = () => {
    setShowPackageBuilder(false);
    
    if (pendingNextStep) {
      onStepChange?.(pendingNextStep);
      setPendingNextStep(null);
    }
  };

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
      originalPrice: service.originalPrice
    }));
  };

  const displayServices = transformServicesForDisplay(selectedServices, language as 'en' | 'ar');

  return {
    activeCategory,
    activeCategoryServices,
    availablePackageServices,
    baseService,
    displayServices,
    handlePackageConfirm,
    handleServiceClick,
    handleServiceToggleWrapper,
    handleSkipPackage,
    handleStepChange,
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
