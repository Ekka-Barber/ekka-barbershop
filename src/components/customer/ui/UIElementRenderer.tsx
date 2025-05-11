
import React from 'react';
import { UIElement } from '../types/uiTypes';
import { ActionButton } from './ActionButton';
import { EidBookingsSection } from '../sections/EidBookingsSection';
import { GoogleReviewsWrapper } from '../sections/GoogleReviewsWrapper';
import { LoyaltySection } from '../sections/LoyaltySection';

interface UIElementRendererProps {
  visibleElements: UIElement[];
  animatingElements: string[];
  isLoadingUiElements: boolean;
  onOpenBranchDialog: () => void;
  onOpenLocationDialog: () => void;
  onOpenEidDialog: () => void;
  onOpenLoyaltyDialog?: () => void;
}

export const UIElementRenderer: React.FC<UIElementRendererProps> = ({
  visibleElements,
  animatingElements,
  isLoadingUiElements,
  onOpenBranchDialog,
  onOpenLocationDialog,
  onOpenEidDialog,
  onOpenLoyaltyDialog = () => {}
}) => {
  if (isLoadingUiElements) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    );
  }

  const renderElement = (element: UIElement) => {
    const isVisible = animatingElements.includes(element.id);
    
    if (!isVisible) return null;

    switch (element.type) {
      case 'button':
        let clickHandler = () => {};
        
        switch(element.name) {
          case 'view_menu':
            clickHandler = () => window.location.href = '/menu';
            break;
          case 'book_now':
            clickHandler = onOpenBranchDialog;
            break;
          case 'our_location': 
            clickHandler = onOpenLocationDialog;
            break;
          default:
            clickHandler = () => console.log('Action clicked:', element.name);
        }
        
        return <ActionButton key={element.id} element={element} onClick={clickHandler} />;
        
      case 'eid_section':
        return (
          <EidBookingsSection 
            key={element.id} 
            element={element} 
            isVisible={isVisible} 
            onOpenEidDialog={onOpenEidDialog}
          />
        );
        
      case 'loyalty_section':
        return (
          <LoyaltySection 
            key={element.id} 
            element={element} 
            isVisible={isVisible} 
            onOpenLoyaltyDialog={onOpenLoyaltyDialog}
          />
        );
        
      case 'review_section':
        return (
          <GoogleReviewsWrapper 
            key={element.id} 
            element={element} 
            isVisible={isVisible} 
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-3 mt-6">
      {visibleElements.map(renderElement)}
    </div>
  );
};
