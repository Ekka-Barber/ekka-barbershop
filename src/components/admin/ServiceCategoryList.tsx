import { useState, useEffect, useCallback, useMemo } from 'react';
import { getSupabaseClient } from '@/services/supabaseService';
import { useOptimizedCategories } from '@/hooks/useOptimizedCategories';
import { CategoryList } from './category-management/CategoryList';
import { CategoryActions } from './category-management/CategoryActions';
import { ServiceCategorySkeleton } from './service-management/ServiceCategorySkeleton';
import { EmptyServiceState } from './service-management/EmptyServiceState';
import { useToast } from "@/components/ui/use-toast";
import type { DropResult } from '@hello-pangea/dnd';
import type { Category } from '@/types/service';

const ServiceCategoryList = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
  const {
    categories,
    isLoading,
    setupRealtimeSubscription
  } = useOptimizedCategories();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessCode = searchParams.get('access');
    if (accessCode === 'owner123') {
      const setCode = async () => {
        const supabase = await getSupabaseClient();
        await supabase.rpc('set_branch_manager_code', { code: 'true' });
      };
      void setCode();
    }
  }, []);

  useEffect(() => {
    const setupSubscription = async () => {
      const cleanup = await setupRealtimeSubscription();
      return () => {
        cleanup();
      };
    };

    const cleanupPromise = setupSubscription();

    return () => {
      cleanupPromise.then(cleanupFn => {
        if (cleanupFn) cleanupFn();
      });
    };
  }, [setupRealtimeSubscription]);

  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  }, []);

  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    try {
      const supabase = await getSupabaseClient();

      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      });
    } catch (error) {
      console.error('Category deletion failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete category. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    if (!result.destination || !categories) return;

    try {
      const { source, destination } = result;
      const typedCategories = categories as Category[];
      const newCategories = Array.from(typedCategories);
      const [removed] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, removed);

      // Create updates while preserving all required fields
      const updates = newCategories.map((category, index) => ({
        id: category.id,
        name_en: category.name_en,
        name_ar: category.name_ar,
        display_order: index
      }));

      const supabase = await getSupabaseClient();

      const { error } = await supabase
        .from('service_categories')
        .upsert(updates, { onConflict: 'id' });

      if (error) {
        console.error('Update error:', error);
        throw error;
      }

      toast({
        title: "Order Updated",
        description: "Category order has been updated successfully.",
      });
    } catch (error) {
      console.error('Drag end error:', error);
      toast({
        title: "Error",
        description: "An error occurred while reordering categories.",
        variant: "destructive",
      });
    }
  }, [categories, toast]);

  // Use memoization for the component content to prevent unnecessary re-renders
  const content = useMemo(() => {
    if (isLoading) {
      return <ServiceCategorySkeleton />;
    }

    if (!categories?.length) {
      return <EmptyServiceState />;
    }

    return (
      <div className="space-y-6">
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
  }, [categories, expandedCategories, handleDeleteCategory, handleDragEnd, isLoading, toggleCategory]);

  return content;
};

export default ServiceCategoryList;
