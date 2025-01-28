import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Category } from '@/types/service';

export const useServiceCategories = () => {
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

      return categories.map(category => ({
        ...category,
        services: category.services?.sort((a, b) => a.display_order - b.display_order)
      })) as Category[];
    }
  });

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

  return {
    categories,
    isLoading,
    deleteCategory: deleteCategoryMutation.mutate,
    updateOrder: updateOrderMutation.mutate
  };
};