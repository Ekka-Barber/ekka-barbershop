
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface UIElement {
  id: string;
  type: string;
  name: string;
  display_name: string;
  display_name_ar?: string;
  is_visible: boolean;
  display_order: number;
  color?: string;
  icon?: string;
  action?: string;
  description?: string;
  description_ar?: string;
}

export const useUIElements = () => {
  const [elements, setElements] = useState<UIElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUIElements = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('ui_elements')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });

        if (error) {
          throw error;
        }

        setElements(data as UIElement[]);
      } catch (err) {
        console.error('Error fetching UI elements:', err);
        setError(err instanceof Error ? err : new Error('Failed to load UI elements'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUIElements();
  }, []);

  return { elements, isLoading, error };
};
