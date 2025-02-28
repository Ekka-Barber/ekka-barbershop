
import { useState } from "react";
import { CategoryTabs } from "./CategoryTabs";
import { ServicesList } from "./ServicesList";
import { ServicesSummary } from "./ServicesSummary";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { EmptyServiceState } from "./EmptyServiceState";
import { BookingStep } from "../BookingProgress";
import { Service, SelectedService } from "@/types/service";

interface ServiceSelectionContainerProps {
  categories: any[];
  selectedServices: SelectedService[];
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
  totalPrice,
}: ServiceSelectionContainerProps) => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    categories && categories.length > 0 ? categories[0]?.id : null
  );

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
  };

  const getActiveCategory = () => {
    return categories.find((cat) => cat.id === activeCategory);
  };

  const renderServiceList = () => {
    if (categories.length === 0) {
      return (
        <EmptyServiceState 
          message={language === "ar" ? "لا توجد خدمات متاحة" : "No services available"} 
          description={language === "ar" ? "لا توجد خدمات متاحة حاليا" : "There are no services available at the moment"} 
        />
      );
    }

    const currentCategory = getActiveCategory();
    if (!currentCategory) return null;

    return (
      <ServicesList
        services={currentCategory.services || []}
        selectedServices={selectedServices.map(service => ({
          id: service.id,
          name: language === "ar" ? service.name_ar : service.name_en,
          price: service.price,
          duration: service.duration
        }))}
        onServiceToggle={onServiceToggle}
        isServiceAvailable={isServiceAvailable}
        language={language}
      />
    );
  };

  const handleNextStep = () => {
    if (onNextStep) {
      onNextStep("datetime");
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
        {/* Category Tabs */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          language={language}
        />

        {/* Services List */}
        <div className="p-4">{renderServiceList()}</div>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <ServicesSummary
          selectedServices={selectedServices.map(service => ({
            id: service.id,
            name: language === "ar" ? service.name_ar : service.name_en,
            price: service.price,
            duration: service.duration
          }))}
          totalDuration={totalDuration}
          totalPrice={totalPrice}
          language={language}
          onNextStep={handleNextStep}
        />
      )}

      {/* Continue Button - removed in favor of the one in ServicesSummary */}
    </div>
  );
};
