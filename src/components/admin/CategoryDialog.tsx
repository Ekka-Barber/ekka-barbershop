import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
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
import { Category } from '@/types/service';

type CategoryDialogProps = {
  categories: Category[] | undefined;
};

export const CategoryDialog = ({ categories }: CategoryDialogProps) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name_en: '', name_ar: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addCategoryMutation = useMutation({
    mutationFn: async (category: { name_en: string; name_ar: string }) => {
      await supabase.rpc('set_branch_manager_code', { code: 'true' });
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
      setCategoryDialogOpen(false);
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

  return (
    <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Category
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
            Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};