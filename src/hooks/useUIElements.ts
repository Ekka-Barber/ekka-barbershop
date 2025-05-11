
import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface UIElement {
  id: string;
  type: string;
  name: string;
  display_name: string;
  display_name_ar: string;
  description: string | null;
  description_ar: string | null;
  is_visible: boolean;
  display_order: number;
  icon: string | null;
  action: string | null;
}

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
        throw error;
      }
      return data as UIElement[];
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
