
import { useQuery } from "@tanstack/react-query";
import { supabase, Database } from "@/types/supabase";
import { useEffect, useMemo } from "react";

export const useUiElements = () => {
  const { data: uiElements, refetch: refetchUiElements, isLoading: isLoadingUiElements } = useQuery({
    queryKey: ['ui-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_elements')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error("Error fetching UI elements:", error);
        throw error;
      }
      console.log("[Customer Page] Raw UI Elements Fetched:", data);
      return data as Database['public']['Tables']['ui_elements']['Row'][];
    }
  });

  const visibleElements = useMemo(() => {
    if (!uiElements) return [];
    const filtered = uiElements.filter(el => el.is_visible);
    console.log("[Customer Page] Visible UI Elements (After Filter):", filtered);
    return filtered;
  }, [uiElements]);

  useEffect(() => {
    const channel = supabase
      .channel('ui_elements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ui_elements'
        },
        () => {
          refetchUiElements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchUiElements]);

  return {
    visibleElements,
    refetchUiElements,
    isLoadingUiElements
  };
};
