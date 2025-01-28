import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { supabase } from "@/integrations/supabase/client";
import { ServiceDialog } from './ServiceDialog';
import { CategoryDialog } from './CategoryDialog';
import { CategoryItem } from './CategoryItem';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { Separator } from "@/components/ui/separator";

const ServiceCategoryList = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
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
      <h2 className="text-lg font-semibold">Service Categories</h2>
      
      <div className="flex flex-col items-center gap-4 mb-6">
        <CategoryDialog categories={categories} />
        <ServiceDialog categories={categories} />
      </div>

      <Separator className="my-4" />

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
                  onDelete={() => deleteCategory(category.id)}
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
