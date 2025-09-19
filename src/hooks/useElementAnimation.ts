
import { useState, useEffect } from 'react';
import type { Tables } from "@/types/supabase";

export const useElementAnimation = (visibleElements: Tables<'ui_elements'>[]) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);

  const startElementAnimation = (elements: Tables<'ui_elements'>[]) => {
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
  
  // Start animations when visible elements change
  useEffect(() => {
    if (visibleElements.length > 0) {
      startElementAnimation(visibleElements);
    }
  }, [visibleElements]);

  return {
    animationComplete,
    animatingElements,
    startElementAnimation
  };
};
