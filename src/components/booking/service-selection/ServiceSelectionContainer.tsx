
import { useState, useRef, useEffect } from 'react';
import { CategoryTabs } from './CategoryTabs';
import { ServicesList } from './ServicesList';
import { ServicesSummary } from './ServicesSummary';
import { EmptyServiceState } from './EmptyServiceState';
import { SelectedService, Category, Service } from '@/types/service';
import { BookingStep } from '../BookingProgress';
import { Language } from '@/types/language';
import "../ServiceSelection.css";

interface ServiceSelectionContainerProps {
  categories: Category[];
  selectedServices: SelectedService[];
  onServiceToggle: (service: Service) => void;
  onNextStep: (step: BookingStep) => void;
  isServiceAvailable: (serviceId: string) => boolean;
  language: Language;
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const servicesListRef = useRef<HTMLDivElement>(null);

  // Log categories for debugging
  useEffect(() => {
    console.log('ServiceSelectionContainer received categories:', categories);
  }, [categories]);

  // Set first category as active on initial load
  useEffect(() => {
    if (categories?.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Scroll to top when category changes
  useEffect(() => {
    if (servicesListRef.current) {
      servicesListRef.current.scrollTop = 0;
    }
  }, [activeCategory]);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  if (!categories || categories.length === 0) {
    return <EmptyServiceState 
      message={language === 'ar' ? 'لا توجد خدمات متاحة' : 'No services available'} 
      description={language === 'ar' ? 'لا توجد خدمات متاحة حاليًا. يرجى المحاولة مرة أخرى لاحقًا.' : 'There are no services available at the moment. Please try again later.'} 
    />;
  }

  // Get the current active category
  const activeServiceCategory = categories.find(cat => cat.id === activeCategory);
  console.log('Active category:', activeServiceCategory);

  return (
    <div className={`flex flex-col h-full ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {categories?.length > 0 && (
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          language={language}
        />
      )}

      <div 
        ref={servicesListRef}
        className="flex-1 overflow-y-auto pt-6 pb-4 hide-scrollbar"
      >
        {activeCategory && (
          <ServicesList
            category={activeServiceCategory}
            selectedServices={selectedServices}
            onServiceToggle={onServiceToggle}
            isServiceAvailable={isServiceAvailable}
            language={language}
          />
        )}
      </div>

      {selectedServices.length > 0 && (
        <ServicesSummary
          selectedServices={selectedServices}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          onNextStep={() => onNextStep('datetime')}
          language={language}
        />
      )}
    </div>
  );
};
