
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { CategoryList } from './category-management/CategoryList';
import { CategoryActions } from './category-management/CategoryActions';
import { ServiceManagementHeader } from './service-management/ServiceManagementHeader';
import { ServiceCategorySkeleton } from './service-management/ServiceCategorySkeleton';
import { EmptyServiceState } from './service-management/EmptyServiceState';
import { useToast } from "@/components/ui/use-toast";

const ServiceCategoryList = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { categories, isLoading, deleteCategory, updateOrder } = useServiceCategories();

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
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'service_categories' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['service-categories'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const handleDragEnd = (result: any) => {
    if (!result.destination || !categories) return;

    const { source, destination, type } = result;

    if (type === 'category') {
      const updatedCategories = Array.from(categories);
      const [removed] = updatedCategories.splice(source.index, 1);
      updatedCategories.splice(destination.index, 0, removed);

      const updates = updatedCategories.map((category, index) => ({
        id: category.id,
        display_order: index
      }));

      updateOrder({ type: 'category', updates });
      toast({
        title: "Order Updated",
        description: "Category order has been updated successfully.",
      });
    } else {
      const sourceCategory = categories.find(c => c.id === source.droppableId);
      const destCategory = categories.find(c => c.id === destination.droppableId);
      
      if (!sourceCategory?.services || !destCategory?.services) return;

      const sourceServices = Array.from(sourceCategory.services);
      const [movedService] = sourceServices.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceServices.splice(destination.index, 0, movedService);
        const updates = sourceServices.map((service, index) => ({
          id: service.id,
          display_order: index,
          category_id: source.droppableId
        }));

        updateOrder({ type: 'service', updates });
        toast({
          title: "Order Updated",
          description: "Service order has been updated successfully.",
        });
      } else {
        const destServices = Array.from(destCategory.services || []);
        destServices.splice(destination.index, 0, {
          ...movedService,
          category_id: destination.droppableId
        });

        const updates = destServices.map((service, index) => ({
          id: service.id,
          display_order: index,
          category_id: destination.droppableId
        }));

        updateOrder({ type: 'service', updates });
        toast({
          title: "Service Moved",
          description: "Service has been moved to a different category.",
        });
      }
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
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

  const filteredCategories = categories?.filter(category => {
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const matchCategory = 
        category.name_en.toLowerCase().includes(searchLower) ||
        category.name_ar.toLowerCase().includes(searchLower);
      const matchServices = category.services?.some(service =>
        service.name_en.toLowerCase().includes(searchLower) ||
        service.name_ar.toLowerCase().includes(searchLower)
      );
      return matchCategory || matchServices;
    }
    
    if (filterBy === 'empty') {
      return !category.services?.length;
    }
    
    return true;
  });

  const sortedCategories = filteredCategories?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'services':
        return (b.services?.length || 0) - (a.services?.length || 0);
      default:
        return a.name_en.localeCompare(b.name_en);
    }
  });

  const totalServices = categories?.reduce((acc, category) => 
    acc + (category.services?.length || 0), 0
  ) || 0;

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
        categories={sortedCategories}
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
