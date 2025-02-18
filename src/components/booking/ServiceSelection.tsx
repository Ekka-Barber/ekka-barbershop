
import { useState, useEffect, useMemo, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ServicesSkeleton } from "./ServicesSkeleton";
import { CategoryTabs } from "./service-selection/CategoryTabs";
import { ServiceCard } from "./service-selection/ServiceCard";
import { ServicesSummary } from "./service-selection/ServicesSummary";
import { LazyLoadComponent } from "@/components/common/LazyLoadComponent";
import { ServiceCardSkeleton } from "./service-selection/ServiceCardSkeleton";
import { cacheServices, getCachedServices, cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { getPlatformType } from "@/services/platformDetection";

const SERVICES_PER_PAGE = 8;

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: string) => void;
}

interface ServiceState {
  selected: any | null;
  isOpen: boolean;
  viewTime: number;
  viewTimes: Record<string, number>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [serviceState, setServiceState] = useState<ServiceState>({
    selected: null,
    isOpen: false,
    viewTime: Date.now(),
    viewTimes: {}
  });
  const [discoveryPath, setDiscoveryPath] = useState<string[]>([]);

  // Memoized sorted categories
  const sortedCategories = useMemo(() => 
    categories?.slice().sort((a, b) => a.display_order - b.display_order),
    [categories]
  );

  // Memoized active category services with pagination
  const activeCategoryServices = useMemo(() => {
    const categoryServices = sortedCategories?.find(
      cat => cat.id === activeCategory
    )?.services.sort((a, b) => a.display_order - b.display_order);

    return categoryServices?.slice(0, currentPage * SERVICES_PER_PAGE);
  }, [activeCategory, currentPage, sortedCategories]);

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

  const handleServiceClick = useCallback(async (service: any) => {
    const timestamp = Date.now();
    setServiceState(prev => ({
      selected: service,
      isOpen: true,
      viewTime: timestamp,
      viewTimes: { ...prev.viewTimes, [service.id]: timestamp }
    }));
    
    await trackServiceInteraction({
      category_id: activeCategory || '',
      service_id: service.id,
      interaction_type: 'service_view',
      discovery_path: discoveryPath,
      selected_service_name: language === 'ar' ? service.name_ar : service.name_en,
      price_viewed: true,
      description_viewed: false
    });
  }, [activeCategory, discoveryPath, language]);

  const handleServiceToggleWrapper = useCallback(async (service: any) => {
    try {
      const startTime = serviceState.viewTimes[service.id];
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
      setServiceState(prev => ({
        ...prev,
        isOpen: false,
        selected: null,
        viewTimes: Object.fromEntries(
          Object.entries(prev.viewTimes).filter(([id]) => id !== service.id)
        )
      }));
    } catch (error) {
      handleServiceToggleError();
      console.error('Service toggle error:', error);
    }
  }, [activeCategory, discoveryPath, language, onServiceToggle, serviceState.viewTimes]);

  const handleServiceToggleError = () => {
    toast({
      variant: "destructive",
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar' 
        ? 'حدث خطأ أثناء إضافة/إزالة الخدمة. يرجى المحاولة مرة أخرى.'
        : 'There was an error adding/removing the service. Please try again.',
    });
  };

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const handleStepChange = useCallback((step: string) => {
    trackServiceInteraction({
      interaction_type: 'service_selection_complete',
      discovery_path: discoveryPath,
      selected_service_name: selectedServices.map(s => language === 'ar' ? s.name_ar : s.name_en).join(', '),
      price_viewed: true,
      description_viewed: true
    });
    onStepChange?.(step);
  }, [discoveryPath, language, onStepChange, selectedServices]);

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

  const hasMoreServices = activeCategoryServices && 
    activeCategoryServices.length < (sortedCategories?.find(cat => cat.id === activeCategory)?.services.length || 0);

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
          <LazyLoadComponent
            key={service.id}
            threshold={100}
            placeholder={<ServiceCardSkeleton />}
          >
            <ServiceCard
              service={service}
              language={language}
              isSelected={selectedServices.some(s => s.id === service.id)}
              onServiceClick={handleServiceClick}
              onServiceToggle={handleServiceToggleWrapper}
            />
          </LazyLoadComponent>
        ))}
      </div>

      {hasMoreServices && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            className="w-full max-w-md"
          >
            {language === 'ar' ? 'تحميل المزيد' : 'Load More'}
          </Button>
        </div>
      )}

      <Sheet 
        open={serviceState.isOpen} 
        onOpenChange={(open) => setServiceState(prev => ({ ...prev, isOpen: open }))}
      >
        <SheetContent side="bottom" className="h-fit">
          {serviceState.selected && (
            <>
              <SheetHeader>
                <SheetTitle>
                  {language === 'ar' ? serviceState.selected.name_ar : serviceState.selected.name_en}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <p className="text-gray-600">
                  {language === 'ar' ? serviceState.selected.description_ar : serviceState.selected.description_en}
                </p>
                
                <Button
                  className="w-full mt-4"
                  onClick={() => handleServiceToggleWrapper(serviceState.selected)}
                >
                  {selectedServices.some(s => s.id === serviceState.selected.id)
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
        totalDuration={selectedServices.reduce((total, service) => total + service.duration, 0)}
        totalPrice={selectedServices.reduce((total, service) => total + service.price, 0)}
        language={language}
        onNextStep={() => handleStepChange('datetime')}
      />
    </div>
  );
};
