
import { useServiceManagement } from '@/hooks/service-selection/useServiceManagement';
import { useCategoryManagement } from '@/hooks/service-selection/useCategoryManagement';
import { CategoryTabs } from './CategoryTabs';
import { ServiceGrid } from './ServiceGrid';
import { ServiceDetailsSheet } from './ServiceDetailsSheet';
import { ServicesSummary } from './ServicesSummary';
import { ServicesSkeleton } from '../booking/ServicesSkeleton';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Service, Category } from '@/types/service';
import { BookingStep } from '@/components/booking/BookingProgress';

interface ServiceSelectionContainerProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  selectedServices: Service[];
  onServiceToggle: (service: Service) => void;
  onStepChange: (step: BookingStep) => void;
}

export const ServiceSelectionContainer = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle,
  onStepChange
}: ServiceSelectionContainerProps) => {
  const { language } = useLanguage();
  const {
    serviceState,
    setServiceState,
    handleServiceClick,
    handleServiceToggleWrapper
  } = useServiceManagement(selectedServices, onServiceToggle);

  const {
    activeCategory,
    sortedCategories,
    activeCategoryServices,
    hasMoreServices,
    handleCategoryChange,
    handleLoadMore
  } = useCategoryManagement(categories);

  const handleNextStep = () => {
    if (selectedServices.length > 0) {
      onStepChange('datetime');
    }
  };

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

  const totalDuration = selectedServices.reduce((total, service) => total + service.duration, 0);
  const totalPrice = selectedServices.reduce((total, service) => total + service.price, 0);

  return (
    <div className="space-y-6 pb-8">
      <CategoryTabs
        categories={sortedCategories || []}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        language={language}
      />

      <ServiceGrid
        services={activeCategoryServices || []}
        selectedServices={selectedServices}
        onServiceClick={handleServiceClick}
        onServiceToggle={handleServiceToggleWrapper}
        hasMore={hasMoreServices}
        onLoadMore={handleLoadMore}
        language={language}
      />

      <ServiceDetailsSheet
        service={serviceState.selected}
        isOpen={serviceState.isOpen}
        onOpenChange={(open) => setServiceState(prev => ({ ...prev, isOpen: open }))}
        onServiceToggle={handleServiceToggleWrapper}
        isSelected={serviceState.selected ? selectedServices.some(s => s.id === serviceState.selected.id) : false}
        language={language}
      />

      <ServicesSummary
        selectedServices={selectedServices}
        totalDuration={totalDuration}
        totalPrice={totalPrice}
        language={language}
        onNextStep={handleNextStep}
      />
    </div>
  );
};
