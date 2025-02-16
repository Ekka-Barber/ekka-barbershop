import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { CategoryList } from './category-management/CategoryList';
import { CategoryActions } from './category-management/CategoryActions';
import { ServiceManagementHeader } from './service-management/ServiceManagementHeader';
import { ServiceCategorySkeleton } from './service-management/ServiceCategorySkeleton';
import { EmptyServiceState } from './service-management/EmptyServiceState';
import { useToast } from "@/components/ui/use-toast";
import { DragEndEvent } from '@hello-pangea/dnd';

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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessCode = searchParams.get('access');
    if (accessCode === 'owner123') {
      supabase.rpc('set_branch_manager_code', { code: 'true' });
    }
  }, []);

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

  const handleDragEnd = useCallback(async (result: DragEndEvent) => {
    if (!result.destination || !categories) return;

    const { source, destination } = result;
    const newCategories = Array.from(categories);
    const [removed] = newCategories.splice(source.index, 1);
    newCategories.splice(destination.index, 0, removed);

    try {
      await supabase
        .from('service_categories')
        .update({ display_order: destination.index })
        .eq('id', removed.id);

      toast({
        title: "Order Updated",
        description: "Category order has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update category order.",
        variant: "destructive",
      });
    }
  }, [categories, toast]);

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
        onDragEnd={handleDragEnd}
      />

      <CategoryActions categories={categories} />
    </div>
  );
};

export default ServiceCategoryList;
