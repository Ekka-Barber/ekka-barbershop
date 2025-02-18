
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
import { useTracking } from "@/hooks/useTracking";
import { getPlatformType } from "@/services/platformDetection";

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
  const [serviceViewTimes, setServiceViewTimes] = useState<Record<string, number>>({});

  // Track category view duration
  useEffect(() => {
    if (activeCategory) {
      const viewStartTime = Date.now();
      cacheActiveCategory(activeCategory);

      trackServiceInteraction({
        category_id: activeCategory,
        interaction_type: 'category_view',
        discovery_path: [...discoveryPath, activeCategory],
        price_viewed: false,
        description_viewed: false
      });

      setDiscoveryPath(prev => [...prev, activeCategory]);

      return () => {
        const viewDuration = Date.now() - viewStartTime;
        trackServiceInteraction({
          category_id: activeCategory,
          interaction_type: 'category_view_end',
          discovery_path: discoveryPath,
          price_viewed: true,
          description_viewed: true,
          view_duration_seconds: Math.floor(viewDuration / 1000)
        });
      };
    }
  }, [activeCategory]);

  // Track service selection persistence
  useEffect(() => {
    if (selectedServices.length > 0) {
      cacheServices(selectedServices);
      trackServiceInteraction({
        interaction_type: 'service_selection_update',
        discovery_path: discoveryPath,
        selected_service_name: selectedServices.map(s => language === 'ar' ? s.name_ar : s.name_en).join(', '),
        price_viewed: true,
        description_viewed: true
      });
    }
  }, [selectedServices]);

  const handleServiceClick = async (service: any) => {
    setSelectedService(service);
    setIsSheetOpen(true);
    setViewStartTime(new Date());
    setServiceViewTimes(prev => ({ ...prev, [service.id]: Date.now() }));
    
    await trackServiceInteraction({
      category_id: activeCategory || '',
      service_id: service.id,
      interaction_type: 'service_view',
      discovery_path: discoveryPath,
      selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
      price_viewed: true,
      description_viewed: false
    });
  };

  const handleServiceToggleWrapper = async (service: any) => {
    try {
      const startTime = serviceViewTimes[service.id];
      const viewDuration = startTime ? Date.now() - startTime : 0;
      
      await trackServiceInteraction({
        category_id: activeCategory || '',
        service_id: service.id,
        interaction_type: 'service_selection',
        discovery_path: discoveryPath,
        selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
        price_viewed: true,
        description_viewed: true,
        view_duration_seconds: Math.floor(viewDuration / 1000)
      });

      onServiceToggle(service);
      setIsSheetOpen(false);
      setViewStartTime(null);
      
      // Remove service from view times after tracking
      const { [service.id]: _, ...remainingTimes } = serviceViewTimes;
      setServiceViewTimes(remainingTimes);
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

  const handleStepChange = (step: string) => {
    trackServiceInteraction({
      interaction_type: 'service_selection_complete',
      discovery_path: discoveryPath,
      selected_service_name: selectedServices.map(s => language === 'ar' ? s.name_ar : s.name_en).join(', '),
      price_viewed: true,
      description_viewed: true
    });
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
