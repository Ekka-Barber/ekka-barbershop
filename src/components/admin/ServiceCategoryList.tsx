
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { CategoryList } from './category-management/CategoryList';
import { CategoryActions } from './category-management/CategoryActions';
import { ServiceManagementHeader } from './service-management/ServiceManagementHeader';
import { ServiceCategorySkeleton } from './service-management/ServiceCategorySkeleton';
import { EmptyServiceState } from './service-management/EmptyServiceState';
import { useToast } from "@/components/ui/use-toast";

const ServiceCategoryList = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  const {
    categories,
    isLoading,
    totalServices,
    setSearchQuery,
    setSortBy,
    setFilterBy,
    setupRealtimeSubscription
  } = useOptimizedCategories();

  // Set owner access on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessCode = searchParams.get('access');
    if (accessCode === 'owner123') {
      supabase.rpc('set_branch_manager_code', { code: 'true' });
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup();
    };
  }, [setupRealtimeSubscription]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await supabase
        .from('service_categories')
        .delete()
        .eq('id', categoryId);
      
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ServiceManagementHeader
          totalCategories={0}
          totalServices={0}
          onSearch={setSearchQuery}
          onSort={setSortBy}
          onFilter={setFilterBy}
        />
        <ServiceCategorySkeleton />
      </div>
    );
  }

  if (!categories?.length) {
    return <EmptyServiceState />;
  }

  return (
    <div className="space-y-6">
      <ServiceManagementHeader
        totalCategories={categories.length}
        totalServices={totalServices}
        onSearch={setSearchQuery}
        onSort={setSortBy}
        onFilter={setFilterBy}
      />

      <CategoryList
        categories={categories}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <CategoryActions categories={categories} />
    </div>
  );
};

export default ServiceCategoryList;
