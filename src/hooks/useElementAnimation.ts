import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export const useElementAnimation = () => {
  const [elements, setElements] = useState<UIElement[]>([]);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElements = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('ui_elements')
          .select('*')
          .eq('is_visible', true)
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setElements(data as UIElement[]);
      } catch (error) {
        console.error('Error fetching UI elements:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElements();
  }, []);

  const startAnimation = (elementId: string) => {
    setAnimatingElements(prev => [...prev, elementId]);
  };

  const stopAnimation = (elementId: string) => {
    setAnimatingElements(prev => prev.filter(id => id !== elementId));
  };

  const isAnimating = (elementId: string) => {
    return animatingElements.includes(elementId);
  };

  return {
    elements,
    isLoading,
    animatingElements,
    startAnimation,
    stopAnimation,
    isAnimating
  };
};
