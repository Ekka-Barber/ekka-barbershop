
import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import type { Tables } from "@/types/supabase";
import { useToast } from "@/components/ui/use-toast";

export const useUIElements = () => {
  const { toast } = useToast();
  const [visibleElements, setVisibleElements] = useState<Tables<'ui_elements'>[]>([]);
  
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

  // Filter visible elements
  useEffect(() => {
    if (!uiElements) return;
    setVisibleElements(uiElements.filter(el => el.is_visible));
  }, [uiElements]);

  // Set up real-time subscription
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

  const handleRefresh = async () => {
    await refetchUiElements();
    toast({
      title: 'Refreshed',
      description: 'Content has been updated',
      duration: 2000,
    });
  };

  return {
    visibleElements,
    isLoadingUiElements,
    refetchUiElements,
    handleRefresh
  };
};
