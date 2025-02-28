
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ServicesSkeleton } from "./ServicesSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cacheServices } from "@/utils/serviceCache";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookingStep } from "./BookingProgress";
import { ServiceSelectionContainer } from "./service-selection/ServiceSelectionContainer";

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

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

  const isComponentLoading = isLoading || availabilityLoading;

  if (isComponentLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <>
      <ServiceSelectionContainer
        categories={categories}
        selectedServices={selectedServices}
        onServiceToggle={handleServiceToggleWrapper}
        onNextStep={onStepChange}
        isServiceAvailable={isServiceAvailable}
        language={language}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
      />

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
                  
                  <button
                    className="w-full px-4 py-2 mt-4 text-white bg-[#C4A484] rounded hover:bg-[#B8997C]"
                    onClick={() => {
                      handleServiceToggleWrapper(selectedService);
                      setIsSheetOpen(false);
                    }}
                  >
                    {selectedServices.some(s => s.id === selectedService.id)
                      ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
                      : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
