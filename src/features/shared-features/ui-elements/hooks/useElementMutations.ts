import { useMutation, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@shared/lib/supabase/client';
import { useToast } from '@shared/ui/components/use-toast';

import type { UiElement } from '../types';

interface UseElementMutationsProps {
    language: string;
}

/**
 * Custom hook for UI elements mutations (visibility toggle and reorder)
 */
export function useElementMutations({ language }: UseElementMutationsProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const updateVisibility = useMutation({
        mutationFn: async ({ id, is_visible }: { id: string; is_visible: boolean }) => {
            const { error } = await supabase
                .from('ui_elements')
                .update({ is_visible })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ui-elements'] });
            toast({
                title: language === 'ar' ? 'تم التحديث' : 'Updated',
                description: language === 'ar' ? 'تم تحديث حالة العنصر' : 'Element visibility updated',
            });
        },
        onError: (error) => {
            toast({
                title: language === 'ar' ? 'خطأ' : 'Error',
                description: language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'An error occurred while updating',
                variant: 'destructive',
            });
            console.error('Error updating visibility:', error);
        },
    });

    const updateOrder = useMutation({
        mutationFn: async (elements: UiElement[]) => {
            const updates = elements.map((element, index) => ({
                id: element.id,
                display_order: index,
                type: element.type,
                name: element.name,
                display_name: element.display_name,
                display_name_ar: element.display_name_ar,
            }));

            const { error } = await supabase.from('ui_elements').upsert(updates);

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

    return {
        updateVisibility,
        updateOrder,
    };
}
