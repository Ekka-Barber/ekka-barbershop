import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, Trash } from 'lucide-react';
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
};

const ServiceCategoryList = () => {
  const [newCategory, setNewCategory] = useState({ name_en: '', name_ar: '' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Category[];
    }
  });

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
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      // Fetch current categories first to preserve existing data
      const { data: currentCategories, error: fetchError } = await supabase
        .from('service_categories')
        .select('*')
        .in('id', updates.map(u => u.id));
      
      if (fetchError) throw fetchError;

      // Merge updates with existing data
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
    }
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination || !categories) return;

    const items = Array.from(categories);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updates = items.map((item, index) => ({
      id: item.id,
      display_order: index
    }));

    updateOrderMutation.mutate(updates);
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
        <Droppable droppableId="categories">
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
                      className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          {...provided.dragHandleProps}
                          className="cursor-move text-gray-400 hover:text-gray-600"
                        >
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{category.name_en}</p>
                          <p className="text-sm text-gray-500">{category.name_ar}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCategoryMutation.mutate(category.id)}
                      >
                        <Trash className="w-4 h-4 text-red-500" />
                      </Button>
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