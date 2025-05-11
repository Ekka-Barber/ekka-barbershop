
import { useState, useEffect } from 'react';
import { UIElement } from './useUIElements';

export const useElementAnimation = (elements: UIElement[] = []) => {
  const [animatingElements, setAnimatingElements] = useState<string[]>([]);

  useEffect(() => {
    // Initialize animations for visible elements
    if (elements.length > 0) {
      const newAnimatingElements = elements.map(element => element.id);
      setAnimatingElements(newAnimatingElements);

      // Remove animation after a delay
      const timer = setTimeout(() => {
        setAnimatingElements([]);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [elements]);

  const isAnimating = (elementId: string) => {
    return animatingElements.includes(elementId);
  };

  return {
    animatingElements,
    isAnimating
  };
};
