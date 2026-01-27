
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from 'react';

import { supabase } from "@shared/lib/supabase/client";
import { Tables } from "@shared/types/supabase";
import { logger } from "@shared/utils/logger";

export const useUIElements = () => {
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
    const filtered = uiElements.filter(el => el.is_visible);
    setVisibleElements(filtered);
  }, [uiElements]);

  // Set up real-time subscription with error handling
  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const setupSubscription = () => {
      try {
        channel = supabase
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
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              logger.info('Successfully subscribed to UI elements changes');
            } else if (status === 'CHANNEL_ERROR') {
              logger.warn('WebSocket channel error - realtime updates disabled');
            } else if (status === 'TIMED_OUT') {
              logger.warn('WebSocket connection timed out - realtime updates disabled');
            } else if (status === 'CLOSED') {
              logger.debug('WebSocket connection closed');
            }
          });
      } catch (error) {
        logger.warn('Failed to set up realtime subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      // Safely remove channel with error handling
      try {
        if (channel) {
          supabase.removeChannel(channel);
        }
      } catch (error) {
        // Silently handle cleanup errors - WebSocket might already be closed
        logger.debug('Channel cleanup warning:', error);
      }
    };
  }, [refetchUiElements]);


  return {
    visibleElements,
    isLoadingUiElements,
    refetchUiElements
  };
};
