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
import { supabase } from "@/integrations/supabase/client";
import { useTracking } from "@/hooks/useTracking";

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
  const { trackServiceInteraction } = useTracking();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [discoveryPath, setDiscoveryPath] = useState<string[]>([]);
  const [viewStartTime, setViewStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
      trackServiceInteraction({
        category_id: activeCategory,
        interaction_type: 'category_view',
        discovery_path: [...discoveryPath, activeCategory],
        price_viewed: false,
        description_viewed: false,
        timestamp: new Date().toISOString()
      });
      setDiscoveryPath(prev => [...prev, activeCategory]);
    }
  }, [activeCategory]);

  useEffect(() => {
    if (selectedServices.length > 0) {
      cacheServices(selectedServices);
    }
  }, [selectedServices]);

  const handleServiceClick = async (service: any) => {
    setSelectedService(service);
    setIsSheetOpen(true);
    setViewStartTime(new Date());
    
    await trackServiceInteraction({
      category_id: activeCategory || '',
      service_id: service.id,
      interaction_type: 'service_view',
      discovery_path: discoveryPath,
      selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
      price_viewed: true,
      description_viewed: false,
      timestamp: new Date().toISOString()
    });
  };

  const handleServiceToggleWrapper = async (service: any) => {
    try {
      const isSelected = selectedServices.some(s => s.id === service.id);
      const viewDuration = viewStartTime ? new Date().getTime() - viewStartTime.getTime() : 0;
      
      await trackServiceInteraction({
        category_id: activeCategory || '',
        service_id: service.id,
        interaction_type: 'service_compare',
        discovery_path: discoveryPath,
        selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
        price_viewed: true,
        description_viewed: true,
        timestamp: new Date().toISOString()
      });

      onServiceToggle(service);
      setIsSheetOpen(false);
      setViewStartTime(null);
    } catch (error) {
      handleServiceToggleError();
      console.error('Service toggle error:', error);
    }
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

  const handleStepChange = async (step: string) => {
    await trackBookingStep(step);
    onStepChange?.(step);
  };

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  const activeCategoryServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services.sort((a, b) => a.display_order - b.display_order);

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

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
            language={language}
            isSelected={selectedServices.some(s => s.id === service.id)}
            onServiceClick={handleServiceClick}
            onServiceToggle={handleServiceToggleWrapper}
          />
        ))}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-fit">
          {selectedService && (
            <>
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
            </>
          )}
        </SheetContent>
      </Sheet>

      <ServicesSummary
        selectedServices={selectedServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language}
        onNextStep={() => handleStepChange('datetime')}
      />
    </div>
  );
};
