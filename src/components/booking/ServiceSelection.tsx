
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
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingStep } from "./BookingProgress";

interface ServiceSelectionProps {
  categories: any[] | undefined;
  isLoading: boolean;
  selectedServices: any[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: BookingStep) => void;
  branchId?: string;
}

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId
}: ServiceSelectionProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch service availability data for the current branch
  const { data: serviceAvailability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['service-availability', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      
      const { data, error } = await supabase
        .from('service_branch_availability')
        .select('*')
        .eq('branch_id', branchId);
        
      if (error) {
        console.error('Error fetching service availability:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!branchId,
  });

  // Check if a service is available at the current branch
  const isServiceAvailable = (serviceId: string): boolean => {
    if (!serviceAvailability || !branchId) return true; // Default to available
    
    const record = serviceAvailability.find(
      item => item.service_id === serviceId && item.branch_id === branchId
    );
    
    // If no record exists, default to available
    return record ? record.is_available : true;
  };

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
  
  // Filter services in the active category based on their availability
  const activeServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services
    .filter(service => isServiceAvailable(service.id))
    .sort((a, b) => a.display_order - b.display_order);

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

  const isComponentLoading = isLoading || availabilityLoading;

  if (isComponentLoading) {
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

  // If no services are available in the active category
  if (activeServices?.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <CategoryTabs
          categories={sortedCategories || []}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          language={language}
        />
        
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-yellow-500" />
          <h3 className="text-lg font-semibold">
            {language === 'ar' ? 'لا توجد خدمات متاحة في هذه الفئة' : 'No Services Available in this Category'}
          </h3>
          <p className="text-gray-500">
            {language === 'ar' 
              ? 'نعتذر، لا توجد خدمات متاحة حالياً في هذه الفئة. يرجى تحديد فئة أخرى.'
              : 'Sorry, there are no services available in this category. Please select another category.'}
          </p>
        </div>
        
        <ServicesSummary
          selectedServices={selectedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={() => onStepChange?.('datetime')}
        />
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
        {activeServices?.map((service: any) => (
          <ServiceCard
            key={service.id}
            service={service}
            isSelected={selectedServices.some(s => s.id === service.id)}
            onSelect={handleServiceToggleWrapper}
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
        selectedServices={selectedServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language}
        onNextStep={() => onStepChange?.('datetime')}
      />
    </div>
  );
};
