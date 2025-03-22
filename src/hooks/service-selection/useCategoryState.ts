
import { useState, useEffect } from "react";
import { cacheActiveCategory, getCachedActiveCategory } from "@/utils/serviceCache";

interface UseCategoryStateProps {
  categories: any[] | undefined;
}

export const useCategoryState = ({ categories }: UseCategoryStateProps) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    if (activeCategory) {
      cacheActiveCategory(activeCategory);
    }
  }, [activeCategory]);

  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);
  const activeCategoryServices = sortedCategories?.find(
    cat => cat.id === activeCategory
  )?.services.sort((a, b) => a.display_order - b.display_order);

  const handleServiceClick = (service: any) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  return {
    activeCategory,
    setActiveCategory,
    selectedService,
    setSelectedService,
    isSheetOpen,
    setIsSheetOpen,
    sortedCategories,
    activeCategoryServices,
    handleServiceClick
  };
};
