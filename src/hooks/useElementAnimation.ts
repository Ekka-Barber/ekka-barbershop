
import { useState, useEffect, useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

type UiElement = Database['public']['Tables']['ui_elements']['Row'];

export const useElementAnimation = (visibleElements: UiElement[]) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);

  const startElementAnimation = (elements: UiElement[]) => {
    setAnimatingElements([]);
    setAnimationComplete(false);
    
    setTimeout(() => {
      setAnimatingElements(['logo']);
      
      setTimeout(() => {
        setAnimatingElements(prev => [...prev, 'headings']);
        
        setTimeout(() => {
          setAnimatingElements(prev => [...prev, 'divider']);
          
          const sortedElements = [...elements].sort((a, b) => a.display_order - b.display_order);
          
          const delay = 300;
          sortedElements.forEach((element, index) => {
            setTimeout(() => {
              setAnimatingElements(prev => [...prev, element.id]);
              
              if (index === sortedElements.length - 1) {
                setAnimationComplete(true);
              }
            }, delay * (index + 1));
          });
        }, 300);
      }, 300);
    }, 100);
  };
  
  // Create a stable reference for the dependency array
  const elementIds = useMemo(() => 
    visibleElements.map(el => el.id).sort().join(','), 
    [visibleElements]
  );

  // Start animations when visible elements change
  useEffect(() => {
    if (visibleElements.length > 0) {
      startElementAnimation(visibleElements);
    }
  }, [elementIds]);

  return {
    animationComplete,
    animatingElements,
    startElementAnimation
  };
};
