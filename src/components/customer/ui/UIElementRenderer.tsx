
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from '@/integrations/supabase/types';
import { ActionButton } from "./ActionButton";

type UiElement = Database['public']['Tables']['ui_elements']['Row'];
import { trackButtonClick } from "@/utils/tiktokTracking";
import { useNavigate } from "react-router-dom";
import { useCallback, Suspense, lazy, useEffect } from "react";

// Lazy load heavy section components
const loadLoyaltySection = () => import("../sections/LoyaltySection").then(mod => ({ default: mod.LoyaltySection }));
const loadEidBookingsSection = () => import("../sections/EidBookingsSection").then(mod => ({ default: mod.EidBookingsSection }));
const loadGoogleReviewsWrapper = () => import("../sections/GoogleReviewsWrapper").then(mod => ({ default: mod.GoogleReviewsWrapper }));

const LoyaltySection = lazy(loadLoyaltySection);
const EidBookingsSection = lazy(loadEidBookingsSection);
const GoogleReviewsWrapper = lazy(loadGoogleReviewsWrapper);

const preloadCustomerSections = () => {
  void loadLoyaltySection();
  void loadEidBookingsSection();
  void loadGoogleReviewsWrapper();
};

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

  useEffect(() => {
    preloadCustomerSections();
  }, []);

  const handleElementAction = useCallback((element: UiElement) => {
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
  }, [language, onOpenBranchDialog, onOpenLocationDialog, onOpenEidDialog, navigate]);
  
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
            <Suspense key={element.id} fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
              <EidBookingsSection
                element={element}
                isVisible={isVisible}
                onOpenEidDialog={onOpenEidDialog}
              />
            </Suspense>
          );
        } else if (element.type === 'section' && element.name === 'loyalty_program') {
          return (
            <Suspense key={element.id} fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
              <LoyaltySection
                element={element}
                isVisible={isVisible}
              />
            </Suspense>
          );
        } else if (element.type === 'section' && element.name === 'google_reviews') {
          return (
            <Suspense key={element.id} fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
              <GoogleReviewsWrapper
                isVisible={isVisible}
              />
            </Suspense>
          );
        }
        return null;
      })}
    </div>
  );
};
