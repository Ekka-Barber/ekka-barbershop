
import { useState, useCallback, useMemo } from 'react';
import { Category, Service } from '@/types/service';
import { getCachedActiveCategory, cacheActiveCategory } from '@/utils/serviceCache';

const SERVICES_PER_PAGE = 8;

export const useCategoryManagement = (categories: Category[] | undefined) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(
    getCachedActiveCategory() || categories?.[0]?.id || null
  );
  const [currentPage, setCurrentPage] = useState(1);

  const handleCategoryChange = useCallback((categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentPage(1);
    cacheActiveCategory(categoryId);
  }, []);

  const sortedCategories = useMemo(() => 
    categories?.slice().sort((a, b) => a.display_order - b.display_order),
    [categories]
  );

  const activeCategoryServices = useMemo(() => {
    const categoryServices = sortedCategories?.find(
      cat => cat.id === activeCategory
    )?.services.sort((a, b) => a.display_order - b.display_order);

    return categoryServices?.slice(0, currentPage * SERVICES_PER_PAGE);
  }, [activeCategory, currentPage, sortedCategories]);

  const hasMoreServices = useMemo(() => {
    if (!sortedCategories || !activeCategory) return false;
    const totalServices = sortedCategories.find(cat => cat.id === activeCategory)?.services.length || 0;
    return (activeCategoryServices?.length || 0) < totalServices;
  }, [activeCategory, activeCategoryServices?.length, sortedCategories]);

  const handleLoadMore = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  return {
    activeCategory,
    sortedCategories,
    activeCategoryServices,
    hasMoreServices,
    handleCategoryChange,
    handleLoadMore
  };
};
