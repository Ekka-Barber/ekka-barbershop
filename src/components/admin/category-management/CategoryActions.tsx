import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
        description: "Category added successfully",
      });
    },
    onError: (error) => {
      toast({
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
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-center items-center gap-4">
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
            <div className="flex justify-center items-center gap-4">
              <CollapsibleTrigger asChild>
                <Button 
                  className="w-[200px] bg-[#C4A484] hover:bg-[#B8997C] text-white"
                >
                  Category {isOpen ? <X className="w-4 h-4 ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                </Button>
              </CollapsibleTrigger>
              
              <ServiceDialog 
                categories={categories} 
                trigger={
                  <Button variant="outline" className="w-[200px] gap-2">
                    <Plus className="w-4 h-4" /> Add Service
                  </Button>
                }
              />
            </div>

            <CollapsibleContent className="space-y-4 animate-accordion-down mt-4">
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
                  dir="rtl"
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
      </div>
    </div>
  );
};
