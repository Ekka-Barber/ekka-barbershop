
import React from 'react';
import { UIElement } from '../types/uiTypes';

interface UIElementRendererProps {
  element: UIElement;
  renderFunctions: Record<string, (element: UIElement) => React.ReactNode>;
  isVisible?: boolean;
}

export const UIElementRenderer: React.FC<UIElementRendererProps> = ({ 
  element, 
  renderFunctions,
  isVisible = true 
}) => {
  if (!element || !isVisible || element.is_visible === false) {
    return null;
  }

  const renderFunction = renderFunctions[element.type];
  
  if (!renderFunction) {
    console.warn(`No render function found for element type: ${element.type}`);
    return null;
  }

  return <>{renderFunction(element)}</>;
};
