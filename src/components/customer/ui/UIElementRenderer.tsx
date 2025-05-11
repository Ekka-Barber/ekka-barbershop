
import React from 'react';
import { UIElement } from '../../../hooks/useUIElements';

interface UIElementRendererProps {
  elements: UIElement[];
  animatingElements: string[];
  isLoading: boolean;
  onOpenBranchDialog: () => void;
  onOpenLocationDialog: () => void;
  onOpenEidDialog: () => void;
}

export const UIElementRenderer: React.FC<UIElementRendererProps> = ({ 
  elements, 
  animatingElements,
  isLoading,
  onOpenBranchDialog,
  onOpenLocationDialog,
  onOpenEidDialog
}) => {
  if (isLoading) {
    return <div>Loading UI elements...</div>;
  }

  const handleElementClick = (element: UIElement) => {
    if (element.action === 'open_branch_dialog') {
      onOpenBranchDialog();
    } else if (element.action === 'open_location_dialog') {
      onOpenLocationDialog();
    } else if (element.action === 'open_eid_dialog') {
      onOpenEidDialog();
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 w-full px-4">
      {elements.map(element => (
        <div 
          key={element.id}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            animatingElements.includes(element.id) ? 'scale-105 shadow-lg' : ''
          }`}
          onClick={() => handleElementClick(element)}
        >
          {element.icon && <div className="text-3xl mb-2">{element.icon}</div>}
          <h3 className="font-semibold">{element.display_name}</h3>
          {element.description && <p className="text-sm text-gray-500">{element.description}</p>}
        </div>
      ))}
    </div>
  );
};
