
import { useState, useEffect, useCallback } from 'react';
import { UIElement } from "@/components/customer/types/uiTypes";

export const useElementAnimation = (visibleElements: UIElement[]) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);

  const startElementAnimation = useCallback((elements: UIElement[]) => {
    // Reset animation state
    setAnimatingElements([]);
    setAnimationComplete(false);
    
    // Start the sequence
    setTimeout(() => {
      console.log('Adding logo to animating elements');
      setAnimatingElements(prev => [...prev, 'logo']);
      
      setTimeout(() => {
        console.log('Adding headings to animating elements');
        setAnimatingElements(prev => [...prev, 'headings']);
        
        setTimeout(() => {
          console.log('Adding divider to animating elements');
          setAnimatingElements(prev => [...prev, 'divider']);
          
          // Sort elements by their display order and animate them sequentially
          const sortedElements = [...elements].sort((a, b) => a.display_order - b.display_order);
          console.log('Sorted elements for animation:', sortedElements);
          
          let delay = 300;
          sortedElements.forEach((element, index) => {
            setTimeout(() => {
              console.log(`Adding element ${element.id} to animating elements`);
              setAnimatingElements(prev => [...prev, element.id]);
              
              if (index === sortedElements.length - 1) {
                setAnimationComplete(true);
              }
            }, delay * (index + 1));
          });
        }, 300);
      }, 300);
    }, 100);
  }, []);
  
  // Start animations when component mounts (only if there are visible elements)
  useEffect(() => {
    if (visibleElements.length > 0) {
      console.log('Starting element animation with visible elements:', visibleElements);
      startElementAnimation(visibleElements);
    }
  }, [visibleElements, startElementAnimation]);

  return {
    animationComplete,
    animatingElements,
    startElementAnimation
  };
};
