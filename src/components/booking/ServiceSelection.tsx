
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ServicesSkeleton } from "./ServicesSkeleton";
import { CategoryTabs } from "./service-selection/CategoryTabs";
import { ServiceCard } from "./service-selection/ServiceCard";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { cacheServices, getCachedServices, cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { PackageBanner } from "./service-selection/PackageBanner";
import { PackageInfoDialog } from "./service-selection/PackageInfoDialog";
import { usePackageDiscount } from "@/hooks/usePackageDiscount";
import { transformServicesForDisplay } from "@/utils/serviceTransformation";

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceSelectionProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showPackageInfo, setShowPackageInfo] = useState(false);

  // Use the package discount hook
  const { 
    BASE_SERVICE_ID, 
    packageEnabled, 
    packageSettings, 
    hasBaseService,
    applyPackageDiscounts 
  } = usePackageDiscount(selectedServices);

  // Process services with package discounts if needed
  const processedServices = applyPackageDiscounts(selectedServices);

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (selectedServices.length > 0) {
      cacheServices(selectedServices);
    }
  }, [selectedServices]);

  // Show a toast notification when the base service is selected
  useEffect(() => {
    if (hasBaseService && packageSettings) {
      toast({
        title: language === 'ar' ? 'وضع الباقة مفعل' : 'Package Mode Activated',
        description: language === 'ar' 
          ? 'يمكنك الآن إضافة خدمات إضافية بخصم'
          : 'You can now add additional services at a discount',
      });
    }
  }, [hasBaseService, packageSettings, language, toast]);

  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const handleServiceToggleError = () => {
    toast({
      variant: "destructive",
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar' 
        ? 'حدث خطأ أثناء إضافة/إزالة الخدمة. يرجى المحاولة مرة أخرى.'
        : 'There was an error adding/removing the service. Please try again.',
    });
  };

  const handleServiceToggleWrapper = (service: any) => {
    try {
      onServiceToggle(service);
    } catch (error) {
      handleServiceToggleError();
      console.error('Service toggle error:', error);
    }
  };

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  const activeCategoryServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services.sort((a, b) => a.display_order - b.display_order);

  // Use processed services for calculations
  const totalDuration = processedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = processedServices.reduce((total, service) => total + service.price, 0);

  // Transform the services to the format expected by ServicesSummary
  const displayServices = transformServicesForDisplay(processedServices, language as 'en' | 'ar');

  if (isLoading) {
    return <ServicesSkeleton />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-yellow-500" />
        <h3 className="text-lg font-semibold">
          {language === 'ar' ? 'لا توجد خدمات متاحة' : 'No Services Available'}
        </h3>
        <p className="text-gray-500">
          {language === 'ar' 
            ? 'نعتذر، لا توجد خدمات متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
            : 'Sorry, there are no services available at the moment. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <PackageBanner 
        isVisible={true} 
        onInfoClick={() => setShowPackageInfo(true)}
      />

      <CategoryTabs
        categories={sortedCategories || []}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        language={language}
      />

      <div className="grid grid-cols-2 gap-4">
        {activeCategoryServices?.map((service: any) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.some(s => s.id === service.id)}
            onSelect={handleServiceToggleWrapper}
            isBasePackageService={service.id === BASE_SERVICE_ID}
            className=""
          />
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="bg-transparent p-0">
          {selectedService && (
            <div className="rounded-t-xl border-t-2 border-[#C4A484] bg-white">
              <div className="p-6 space-y-6">
                <SheetHeader>
                  <SheetTitle>
                    {language === 'ar' ? selectedService.name_ar : selectedService.name_en}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <p className="text-gray-600">
                    {language === 'ar' ? selectedService.description_ar : selectedService.description_en}
                  </p>
                  
                  <Button
                    className="w-full mt-4"
                    onClick={() => {
                      handleServiceToggleWrapper(selectedService);
                      setIsSheetOpen(false);
                    }}
                  >
                    {selectedServices.some(s => s.id === selectedService.id)
                      ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
                      : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ServicesSummary
        selectedServices={displayServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language as 'en' | 'ar'}
        onNextStep={() => onStepChange?.('datetime')}
        onPrevStep={() => {}} // Adding the missing onPrevStep prop
        isFirstStep={true} // Adding the missing isFirstStep prop - set to true since this is the first step
        packageEnabled={packageEnabled}
        packageSettings={packageSettings}
      />

      <PackageInfoDialog 
        isOpen={showPackageInfo} 
        onClose={() => setShowPackageInfo(false)}
        packageSettings={packageSettings}
      />
    </div>
  );
};
