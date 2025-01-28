import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Category = {
  id: string;
  name_en: string;
  name_ar: string;
  display_order: number;
  services?: Service[];
};

type Service = {
  id: string;
  category_id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  duration: number;
  price: number;
  display_order: number;
};

const ServiceCategoryList = () => {
  const [newCategory, setNewCategory] = useState({ name_en: '', name_ar: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*, services(*)')
        .order('display_order');
      
      if (categoriesError) throw categoriesError;

      // Sort services within each category
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

  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name_en: string; name_ar: string }) => {
      const { data, error } = await supabase
        .from('service_categories')
        .insert([{ 
          name_en: category.name_en, 
          name_ar: category.name_ar,
          display_order: categories ? categories.length : 0 
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      setDialogOpen(false);
      setNewCategory({ name_en: '', name_ar: '' });
      toast({
        title: "Success",
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add category",
        variant: "destructive",
      });
      console.error('Add error:', error);
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
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
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination || !categories) return;

    const { source, destination, type } = result;

    if (type === 'category') {
      const items = Array.from(categories);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const updates = items.map((item, index) => ({
        id: item.id,
        display_order: index
      }));

      updateOrderMutation.mutate({ type: 'category', updates });
    } else {
      // Handle service reordering
      const sourceCategory = categories.find(c => c.id === source.droppableId);
      const destCategory = categories.find(c => c.id === destination.droppableId);
      
      if (!sourceCategory?.services || !destCategory?.services) return;

      const sourceServices = Array.from(sourceCategory.services);
      const [movedService] = sourceServices.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Reordering within the same category
        sourceServices.splice(destination.index, 0, movedService);
        const updates = sourceServices.map((service, index) => ({
          id: service.id,
          display_order: index,
          category_id: source.droppableId
        }));

        updateOrderMutation.mutate({ type: 'service', updates });
      } else {
        // Moving to a different category
        const destServices = Array.from(destCategory.services);
        destServices.splice(destination.index, 0, movedService);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">English Name</label>
                <Input
                  value={newCategory.name_en}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
                  placeholder="Enter category name in English"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Arabic Name</label>
                <Input
                  value={newCategory.name_ar}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value }))}
                  placeholder="Enter category name in Arabic"
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => addCategoryMutation.mutate(newCategory)}
                disabled={!newCategory.name_en || !newCategory.name_ar}
              >
                Add Category
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                <Draggable 
                  key={category.id} 
                  draggableId={category.id} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                        <div className="flex items-center gap-3">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-move text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical className="w-5 h-5" />
                          </div>
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="flex items-center gap-2"
                          >
                            {expandedCategories.includes(category.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                            <div>
                              <p className="font-medium">{category.name_en}</p>
                              <p className="text-sm text-gray-500">{category.name_ar}</p>
                            </div>
                          </button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategoryMutation.mutate(category.id)}
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>

                      {expandedCategories.includes(category.id) && (
                        <Droppable droppableId={category.id} type="service">
                          {(provided) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              className="ml-8 space-y-2"
                            >
                              {category.services?.map((service, index) => (
                                <Draggable
                                  key={service.id}
                                  draggableId={service.id}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                        <div>
                                          <p className="text-sm font-medium">{service.name_en}</p>
                                          <p className="text-xs text-gray-500">{service.name_ar}</p>
                                        </div>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {service.duration} mins • ${service.price}
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  )}
                </Draggable>
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