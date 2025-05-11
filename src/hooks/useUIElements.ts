
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { UIElement } from '@/components/customer/types/uiTypes';

export const useUIElements = () => {
  const { toast } = useToast();
  const [visibleElements, setVisibleElements] = useState<UIElement[]>([]);
  
  const { data: uiElements, refetch: refetchUiElements, isLoading: isLoadingUiElements } = useQuery({
    queryKey: ['ui-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_elements')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching UI elements:', error);
        throw error;
      }
      
      console.log('UI Elements fetched:', data);
      return data as UIElement[];
    }
  });

  // Filter visible elements
  useEffect(() => {
    if (!uiElements) return;
    
    const visible = uiElements.filter(el => el.is_visible);
    console.log('Visible elements:', visible);
    setVisibleElements(visible);
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
          console.log('UI elements table changed, refreshing data...');
          refetchUiElements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchUiElements]);

  const handleRefresh = async () => {
    try {
      await refetchUiElements();
      toast({
        title: 'Refreshed',
        description: 'Content has been updated',
        duration: 2000,
      });
    } catch (error) {
      console.error('Error refreshing UI elements:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh content',
        variant: 'destructive',
        duration: 2000,
      });
    }
  };

  return {
    visibleElements,
    isLoadingUiElements,
    refetchUiElements,
    handleRefresh
  };
};
