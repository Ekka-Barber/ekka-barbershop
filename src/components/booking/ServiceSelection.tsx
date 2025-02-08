import { useLanguage } from "@/contexts/LanguageContext";
import { Checkbox } from "@/components/ui/checkbox";
import { ServicesSkeleton } from "./ServicesSkeleton";
import { Badge } from "@/components/ui/badge";
import { Slash, Timer, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { FixedSizeGrid as Grid } from 'react-window';
import PullToRefresh from 'react-pull-to-refresh';
import { cacheServices, getCachedServices, cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  duration: number;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number | null;
  display_order: number;
}

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  services: Service[];
  display_order: number;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ServiceSelectionProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: Service) => void;
}

const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle
}: ServiceSelectionProps) => {
  const { language } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger a refetch of the categories data
      // This should be handled by the parent component's refetch function
      // For now, we'll just simulate a refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsRefreshing(false);
    }
  };

  const trackServiceAction = async (service: Service, action: 'added' | 'removed') => {
    try {
      await supabase
        .from('service_tracking')
        .insert([{
          service_name: language === 'ar' ? service.name_ar : service.name_en,
          action,
          timestamp: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking service action:', error);
    }
  };

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.id === service.id);
    trackServiceAction(service, isSelected ? 'removed' : 'added');
    onServiceToggle(service);
  };

  const formatPrice = (price: number) => {
    const roundedPrice = roundPrice(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const getArabicTimeUnit = (duration: number) => {
    return duration >= 5 && duration <= 10 ? 'دقائق' : 'دقيقة';
  };

  const calculateDiscountedPrice = (service: Service) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    let discountedPrice;
    if (service.discount_type === 'percentage') {
      discountedPrice = service.price - (service.price * (service.discount_value / 100));
    } else {
      discountedPrice = service.price - service.discount_value;
    }
    return roundPrice(discountedPrice);
  };

  const hasDiscount = (service: Service) => {
    return service.discount_type && service.discount_value;
  };

  const handleServiceClick = (service: Service) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  const activeCategoryServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services.sort((a, b) => a.display_order - b.display_order);

  if (isLoading) {
    return <ServicesSkeleton />;
  }

  const ServiceCard = ({ service }: { service: Service }) => (
    <div
      className={`rounded-lg border p-4 space-y-2 transition-all cursor-pointer relative ${
        selectedServices.some(s => s.id === service.id)
          ? 'bg-[#e7bd71]/10 border-[#e7bd71]'
          : 'hover:border-gray-300'
      }`}
      onClick={() => handleServiceClick(service)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">
          {language === 'ar' ? service.name_ar : service.name_en}
        </h3>
        {hasDiscount(service) && (
          <Badge variant="destructive" className="text-xs">
            {service.discount_type === 'percentage' 
              ? `${service.discount_value}%` 
              : formatPrice(service.discount_value || 0)}
          </Badge>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500">
        <Timer className="w-4 h-4 mr-1" />
        <span>
          {service.duration} {language === 'ar' 
            ? getArabicTimeUnit(service.duration)
            : 'min'}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {hasDiscount(service) ? (
            <>
              <span className="relative inline-flex items-center text-sm text-gray-500">
                {formatPrice(service.price)}
                <Slash className="w-4 h-4 text-destructive absolute -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2" />
              </span>
              <span className="font-medium">
                {formatPrice(calculateDiscountedPrice(service))}
              </span>
            </>
          ) : (
            <span>{formatPrice(service.price)}</span>
          )}
        </div>
        
        <Button
          size="sm"
          variant={selectedServices.some(s => s.id === service.id) ? "default" : "outline"}
          className={`rounded-full p-2 h-8 w-8 ${
            selectedServices.some(s => s.id === service.id)
              ? 'bg-[#e7bd71] hover:bg-[#d4ad65]'
              : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            handleServiceToggle(service);
          }}
        >
          {selectedServices.some(s => s.id === service.id) ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex overflow-x-auto pb-2 hide-scrollbar sticky top-0 bg-white z-10 pt-2">
        {sortedCategories?.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-shrink-0 px-6 py-2 rounded-full mx-1 transition-all ${
              activeCategory === category.id
                ? 'bg-[#e7bd71] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {language === 'ar' ? category.name_ar : category.name_en}
          </button>
        ))}
      </div>

      <PullToRefresh
        onRefresh={handleRefresh}
        className="pull-to-refresh"
        pullDownThreshold={70}
        resistance={2.5}
      >
        <div className="grid grid-cols-2 gap-4">
          {activeCategoryServices?.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </PullToRefresh>

      {/* Service Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh]">
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
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span>
                      {selectedService.duration} {language === 'ar' 
                        ? getArabicTimeUnit(selectedService.duration)
                        : 'min'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasDiscount(selectedService) ? (
                      <>
                        <span className="relative inline-flex items-center text-gray-500">
                          {formatPrice(selectedService.price)}
                          <Slash className="w-4 h-4 text-destructive absolute -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2" />
                        </span>
                        <span className="font-medium">
                          {formatPrice(calculateDiscountedPrice(selectedService))}
                        </span>
                      </>
                    ) : (
                      <span>{formatPrice(selectedService.price)}</span>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  onClick={() => {
                    handleServiceToggle(selectedService);
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

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">
                {selectedServices.length} {language === 'ar' ? 'خدمات' : 'services'}
              </span>
              <span className="text-gray-500 mx-2">•</span>
              <span>
                {formatPrice(
                  selectedServices.reduce((total, service) => total + service.price, 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
