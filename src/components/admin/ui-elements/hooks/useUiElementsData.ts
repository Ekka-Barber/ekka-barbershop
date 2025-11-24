import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { UiElement } from '../types';

/**
 * Custom hook for fetching UI elements data
 */
export function useUiElementsData() {
    return useQuery({
        queryKey: ['ui-elements'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('ui_elements')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            return data as UiElement[];
        },
    });
}
