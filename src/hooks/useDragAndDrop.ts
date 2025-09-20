import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseClient } from '@/services/supabaseService';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DropResult } from '@hello-pangea/dnd';

interface DraggableElement {
  id: string;
  display_order: number;
  type: string;
  name: string;
  display_name: string;
  display_name_ar: string;
}

export const useDragAndDrop = <T extends DraggableElement>(elements: T[] | undefined) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  const updateOrderMutation = useMutation({
    mutationFn: async (elements: T[]) => {
      const supabase = await getSupabaseClient();

      const updates = elements.map((element, index) => ({
        id: element.id,
        display_order: index,
        type: element.type,
        name: element.name,
        display_name: element.display_name,
        display_name_ar: element.display_name_ar
      }));

      const { error } = await supabase
        .from('ui_elements')
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ui-elements'] });
      toast({
        title: language === 'ar' ? 'تم التحديث' : 'Updated',
        description: language === 'ar' ? 'تم تحديث ترتيب العناصر' : 'Elements order updated',
      });
    },
    onError: (error) => {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تحديث الترتيب' : 'An error occurred while updating order',
        variant: 'destructive',
      });
      console.error('Error updating order:', error);
    },
  });

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !elements) return;

    const items = Array.from(elements);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateOrderMutation.mutate(items);
  };

  return {
    handleDragEnd,
    isUpdating: updateOrderMutation.isPending
  };
};
