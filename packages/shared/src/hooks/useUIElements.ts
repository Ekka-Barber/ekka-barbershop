
import { useQuery } from "@tanstack/react-query";
import { useMemo } from 'react';

import { useRealtimeSubscription } from '@shared/hooks/useRealtimeSubscription';
import { supabase } from "@shared/lib/supabase/client";
import { Tables } from "@shared/types/supabase";

export const useUIElements = () => {
  const { data: uiElements, refetch: refetchUiElements, isLoading: isLoadingUiElements } = useQuery({
    queryKey: ['ui-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_elements')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        throw error;
      }
      return data as Tables<'ui_elements'>[];
    }
  });

  // Realtime: auto-refetch when ui_elements change
  useRealtimeSubscription({
    table: 'ui_elements',
    queryKeys: [['ui-elements']],
  });

  // Derive visible elements (no extra state needed)
  const visibleElements = useMemo(
    () => uiElements?.filter(el => el.is_visible) ?? [],
    [uiElements]
  );

  return {
    visibleElements,
    isLoadingUiElements,
    refetchUiElements
  };
};
