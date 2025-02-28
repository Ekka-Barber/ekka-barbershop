
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ServiceDialog } from '../ServiceDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Category } from '@/types/service';

interface CategoryActionsProps {
  categories: Category[] | undefined;
}

export const CategoryActions = ({ categories }: CategoryActionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
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
      setIsOpen(false);
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

  const handleSubmit = () => {
    if (!newCategory.name_en || !newCategory.name_ar) return;
    addCategoryMutation.mutate(newCategory);
  };

  return (
    <div className="flex justify-center gap-4 pt-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full max-w-md">
        <div className="flex justify-center items-center gap-4">
          <CollapsibleTrigger asChild>
            <Button 
              variant="default"
              className="rounded-full gap-2 px-6"
            >
              Category {isOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <ServiceDialog 
            categories={categories} 
            trigger={
              <Button variant="outline" className="rounded-full gap-2 px-6">
                <Plus className="w-4 h-4" /> Add Service
              </Button>
            }
          />
        </div>

        <CollapsibleContent className="space-y-4 animate-accordion-down mt-4 bg-white p-4 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <label className="text-sm font-medium">English Name</label>
            <Input
              value={newCategory.name_en}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
              placeholder="Enter category name in English"
              className="border-gray-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Arabic Name</label>
            <Input
              value={newCategory.name_ar}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name_ar: e.target.value }))}
              placeholder="Enter category name in Arabic"
              dir="rtl"
              className="border-gray-300"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setNewCategory({ name_en: '', name_ar: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!newCategory.name_en || !newCategory.name_ar}
            >
              Add Category
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
