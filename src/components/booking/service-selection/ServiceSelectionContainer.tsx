
import { useState, useEffect } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { ServicesList } from "./ServicesList";
import { EmptyServiceState } from "./EmptyServiceState";
import { ServicesSummary } from "./ServicesSummary";
import { cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";
import { BookingStep } from "../BookingProgress";
import { Category, Service } from "@/types/service";

interface ServiceSelectionContainerProps {
  categories: Category[] | undefined;
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onNextStep?: (step: BookingStep) => void;
  isServiceAvailable: (serviceId: string) => boolean;
  language: string;
  totalDuration: number;
  totalPrice: number;
}

export const ServiceSelectionContainer = ({
  categories,
  selectedServices,
  onServiceToggle,
  onNextStep,
  isServiceAvailable,
  language,
  totalDuration,
  totalPrice
}: ServiceSelectionContainerProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
    }
  }, [activeCategory]);

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  
  // Filter services in the active category based on their availability
  const activeServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services
    .filter(service => isServiceAvailable(service.id))
    .sort((a, b) => a.display_order - b.display_order);

  if (!categories || categories.length === 0) {
    return (
      <EmptyServiceState
        message={language === 'ar' ? 'لا توجد خدمات متاحة' : 'No Services Available'}
        description={language === 'ar' 
          ? 'نعتذر، لا توجد خدمات متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً.'
          : 'Sorry, there are no services available at the moment. Please try again later.'}
      />
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
        
        <EmptyServiceState
          message={language === 'ar' ? 'لا توجد خدمات متاحة في هذه الفئة' : 'No Services Available in this Category'}
          description={language === 'ar' 
            ? 'نعتذر، لا توجد خدمات متاحة حالياً في هذه الفئة. يرجى تحديد فئة أخرى.'
            : 'Sorry, there are no services available in this category. Please select another category.'}
        />
        
        <ServicesSummary
          selectedServices={selectedServices}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={() => onNextStep?.('datetime')}
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

      {activeServices && (
        <ServicesList 
          services={activeServices}
          selectedServices={selectedServices}
          onServiceToggle={onServiceToggle}
        />
      )}

      <ServicesSummary
        selectedServices={selectedServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language}
        onNextStep={() => onNextStep?.('datetime')}
      />
    </div>
  );
};
