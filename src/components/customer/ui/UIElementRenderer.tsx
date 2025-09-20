
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from '@/integrations/supabase/types';
import { ActionButton } from "./ActionButton";

type UiElement = Database['public']['Tables']['ui_elements']['Row'];
import { LoyaltySection } from "../sections/LoyaltySection";
import { EidBookingsSection } from "../sections/EidBookingsSection";
import { GoogleReviewsWrapper } from "../sections/GoogleReviewsWrapper";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { useNavigate } from "react-router-dom";

interface UIElementRendererProps {
  visibleElements: UiElement[];
  animatingElements: string[];
  isLoadingUiElements: boolean;
  onOpenBranchDialog: () => void;
  onOpenLocationDialog: () => void;
  onOpenEidDialog: () => void;
}

export const UIElementRenderer = ({
  visibleElements,
  animatingElements,
  isLoadingUiElements,
  onOpenBranchDialog,
  onOpenLocationDialog,
  onOpenEidDialog
}: UIElementRendererProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  const handleElementAction = (element: UiElement) => {
    trackButtonClick({
      buttonId: element.name,
      buttonName: language === 'ar' ? element.display_name_ar : element.display_name
    });

    if (element.action?.startsWith('http')) {
      window.open(element.action, '_blank');
    } else if (element.action === 'openBranchDialog') {
      onOpenBranchDialog();
    } else if (element.action === 'openLocationDialog') {
      onOpenLocationDialog();
    } else if (element.action === 'openEidBookingsDialog') {
      onOpenEidDialog();
    } else if (element.action) {
      navigate(element.action);
    }
  };
  
  if (isLoadingUiElements) {
    return (
      <div className="w-full max-w-xs mx-auto space-y-4">
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-xs mx-auto space-y-4">
      {visibleElements.map((element) => {
        const isVisible = animatingElements.includes(element.id);
        
        if (element.type === 'button') {
          return (
            <div key={element.id}>
              {isVisible && (
                <ActionButton 
                  element={element}
                  onClick={() => handleElementAction(element)}
                />
              )}
            </div>
          );
        } else if (element.type === 'section' && element.name === 'eid_bookings') {
          return (
            <EidBookingsSection
              key={element.id}
              element={element}
              isVisible={isVisible}
              onOpenEidDialog={onOpenEidDialog}
            />
          );
        } else if (element.type === 'section' && element.name === 'loyalty_program') {
          return (
            <LoyaltySection 
              key={element.id}
              element={element}
              isVisible={isVisible}
            />
          );
        } else if (element.type === 'section' && element.name === 'google_reviews') {
          return (
            <GoogleReviewsWrapper
              key={element.id} 
              element={element}
              isVisible={isVisible}
            />
          );
        }
        return null;
      })}
    </div>
  );
};
