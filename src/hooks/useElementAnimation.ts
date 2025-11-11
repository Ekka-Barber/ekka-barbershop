
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Database } from '@/integrations/supabase/types';

type UiElement = Database['public']['Tables']['ui_elements']['Row'];

export const useElementAnimation = (visibleElements: UiElement[]) => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);
  const timeoutIdsRef = useRef<number[]>([]);

  // Clear all existing timeouts
  const clearTimeouts = () => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
  };

  const startElementAnimation = useCallback((elements: UiElement[]) => {
    // Clear any existing timeouts before starting new animation
    clearTimeouts();

    setAnimatingElements([]);
    setAnimationComplete(false);

    const timeout1 = setTimeout(() => {
      setAnimatingElements(['logo']);

      const timeout2 = setTimeout(() => {
        setAnimatingElements(prev => [...prev, 'headings']);

        const timeout3 = setTimeout(() => {
          setAnimatingElements(prev => [...prev, 'divider']);

          const sortedElements = [...elements].sort((a, b) => a.display_order - b.display_order);

          const delay = 300;
          sortedElements.forEach((element, index) => {
            const timeout = setTimeout(() => {
              setAnimatingElements(prev => [...prev, element.id]);

              if (index === sortedElements.length - 1) {
                setAnimationComplete(true);
              }
            }, delay * (index + 1));
            timeoutIdsRef.current.push(timeout);
          });
        }, 300);
        timeoutIdsRef.current.push(timeout3);
      }, 300);
      timeoutIdsRef.current.push(timeout2);
    }, 100);
    timeoutIdsRef.current.push(timeout1);
  }, []);
  
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
  }, [elementIds, visibleElements, startElementAnimation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, []);

  return {
    animationComplete,
    animatingElements,
    startElementAnimation
  };
};
