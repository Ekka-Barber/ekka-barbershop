
import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Category } from '@/types/service';

export const useServiceCategories = () => {
  const [newCategory, setNewCategory] = useState<{ name_en: string; name_ar: string }>({ name_en: '', name_ar: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name_en: string; name_ar: string }) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { data, error } = await supabase
        .from('service_categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      setNewCategory({ name_en: '', name_ar: '' });
      toast({
        description: "Category has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
      console.error('Add error:', error);
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (category: Category) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
      const { error } = await supabase
        .from('service_categories')
        .update({ 
          name_en: category.name_en,
          name_ar: category.name_ar
        })
        .eq('id', category.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-categories'] });
      toast({
        description: "Category has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
      console.error('Update error:', error);
    }
  });

  return {
    newCategory,
    setNewCategory,
    addCategory: addCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    isLoading: addCategoryMutation.isPending || updateCategoryMutation.isPending
  };
};
