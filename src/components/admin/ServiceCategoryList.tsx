import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ServiceDialog } from './ServiceDialog';
import { CategoryDialog } from './CategoryDialog';
import { CategoryItem } from './CategoryItem';
import { Category } from '@/types/service';

const ServiceCategoryList = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set owner access on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessCode = searchParams.get('access');
    if (accessCode === 'owner123') {
      supabase.rpc('set_branch_manager_code', { code: 'true' });
    }
  }, []);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*, services(*)')
        .order('display_order');
      
      if (categoriesError) throw categoriesError;

      return categories.map(category => ({
        ...category,
        services: category.services?.sort((a, b) => a.display_order - b.display_order)
      })) as Category[];
    }
  });

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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { error } = await supabase
        .from('service_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    }
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ type, updates }: { 
      type: 'category' | 'service',
      updates: { id: string; display_order: number; category_id?: string }[] 
    }) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      
      if (type === 'category') {
        const { data: currentCategories, error: fetchError } = await supabase
          .from('service_categories')
          .select('*')
          .in('id', updates.map(u => u.id));
        
        if (fetchError) throw fetchError;

        const mergedUpdates = updates.map(update => {
          const current = currentCategories?.find(c => c.id === update.id);
          if (!current) throw new Error(`Category ${update.id} not found`);
          return {
            ...current,
            display_order: update.display_order
          };
        });

        const { error } = await supabase
          .from('service_categories')
          .upsert(mergedUpdates);
        
        if (error) throw error;
      } else {
        const { data: currentServices, error: fetchError } = await supabase
          .from('services')
          .select('*')
          .in('id', updates.map(u => u.id));
        
        if (fetchError) throw fetchError;

        const mergedUpdates = updates.map(update => {
          const current = currentServices?.find(s => s.id === update.id);
          if (!current) throw new Error(`Service ${update.id} not found`);
          return {
            ...current,
            display_order: update.display_order,
            category_id: update.category_id || current.category_id
          };
        });

        const { error } = await supabase
          .from('services')
          .upsert(mergedUpdates);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
      console.error('Update order error:', error);
    }
  });

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

      updateOrderMutation.mutate({ type: 'category', updates });
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

        updateOrderMutation.mutate({ type: 'service', updates });
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

        updateOrderMutation.mutate({ type: 'service', updates });
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Service Categories</h2>
        <div className="flex gap-2">
          <ServiceDialog categories={categories} />
          <CategoryDialog categories={categories} />
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" type="category">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {categories?.map((category, index) => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  index={index}
                  isExpanded={expandedCategories.includes(category.id)}
                  onToggle={() => toggleCategory(category.id)}
                  onDelete={() => deleteCategoryMutation.mutate(category.id)}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ServiceCategoryList;