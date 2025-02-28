
import { useState, useEffect } from "react";
import { ServiceSelectionContainer } from "../service-selection/ServiceSelectionContainer";
import { useServiceAvailability } from "@/hooks/useServiceAvailability";
import { BookingStep } from "../BookingProgress";
import { SelectedService, Service } from "@/types/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ServiceStepProps {
  selectedServices: SelectedService[];
  onServiceToggle: (service: any) => void;
  onStepChange?: (step: BookingStep) => void;
  branchId?: string;
  categories?: any[];
  categoriesLoading?: boolean;
  totalPrice?: number;
  totalDuration?: number;
}

const ServiceStep: React.FC<ServiceStepProps> = ({
  selectedServices,
  onServiceToggle,
  onStepChange,
  branchId,
  categories: propCategories,
  categoriesLoading: propCategoriesLoading,
  totalPrice: propTotalPrice,
  totalDuration: propTotalDuration
}) => {
  const { language } = useLanguage();
  const { isServiceAvailable } = useServiceAvailability(branchId);
  
  // Use props if provided, otherwise fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['service_categories', branchId],
    queryFn: async () => {
      if (propCategories) return propCategories;
      
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select(`
          id,
          name_en,
          name_ar,
          display_order,
          created_at,
          services (
            id,
            name_en,
            name_ar,
            description_en,
            description_ar,
            price,
            duration,
            category_id,
            display_order,
            discount_type,
            discount_value
          )
        `)
        .order('display_order', { ascending: true });
      
      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        throw categoriesError;
      }
      
      return categories?.map(category => ({
        ...category,
        services: category.services
          .sort((a: any, b: any) => (a?.display_order || 0) - (b?.display_order || 0))
      }));
    },
    enabled: !propCategories && !!branchId,
  });

  const totalDuration = propTotalDuration || selectedServices.reduce((sum, service) => sum + service.duration, 0);
  const totalPrice = propTotalPrice || selectedServices.reduce((sum, service) => sum + service.price, 0);

  if (propCategoriesLoading || (!propCategories && categoriesLoading)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-16rem)]">
      <ServiceSelectionContainer
        categories={propCategories || categories || []}
        selectedServices={selectedServices}
        onServiceToggle={onServiceToggle}
        onNextStep={(step) => onStepChange?.(step)}
        isServiceAvailable={isServiceAvailable}
        language={language}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
      />
    </div>
  );
};

export default ServiceStep;
