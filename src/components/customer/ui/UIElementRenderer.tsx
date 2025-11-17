
import { useCallback, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/integrations/supabase/types";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { ActionButton } from "./ActionButton";

type UiElement = Database['public']['Tables']['ui_elements']['Row'];

// Lazy load heavy section components
const LoyaltySection = lazyWithRetry(() => import("../sections/LoyaltySection"));
const BookingsSection = lazyWithRetry(() => import("../sections/BookingsSection"));
const EidBookingsSection = lazyWithRetry(() => import("../sections/EidBookingsSection"));
const GoogleReviewsWrapper = lazyWithRetry(() => import("../sections/GoogleReviewsWrapper"));

interface UIElementRendererProps {
  visibleElements: UiElement[];
  animatingElements: string[];
  isLoadingUiElements: boolean;
  onOpenBranchDialog: () => void;
  onOpenLocationDialog: () => void;
  onOpenBookingsDialog: () => void;
  onOpenEidDialog: () => void;
  onOpenMarketingDialog?: (contentType: 'menu' | 'offers', initialIndex?: number) => void;
}

export const UIElementRenderer = ({
  visibleElements,
  animatingElements,
  isLoadingUiElements,
  onOpenBranchDialog,
  onOpenLocationDialog,
  onOpenBookingsDialog,
  onOpenEidDialog,
  onOpenMarketingDialog
}: UIElementRendererProps) => {
  const navigate = useNavigate();
  const { language } = useLanguage();


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
    } else if (element.action === 'openBookingsDialog') {
      onOpenBookingsDialog();
    } else if (element.action === 'openEidBookingsDialog') {
      onOpenEidDialog();
    } else if (element.action === '/menu' && onOpenMarketingDialog) {
      onOpenMarketingDialog('menu', 0);
    } else if (element.action === '/offers' && onOpenMarketingDialog) {
      onOpenMarketingDialog('offers', 0);
    } else if (element.action) {
      // Fallback: try to navigate if action looks like a route
      navigate(element.action);
    }
  }, [language, onOpenBranchDialog, onOpenLocationDialog, onOpenBookingsDialog, onOpenEidDialog, onOpenMarketingDialog, navigate]);
  
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
        } else if (element.type === 'section' && element.name === 'bookings') {
          return (
            <Suspense key={element.id} fallback={<div className="h-32 bg-gray-100 rounded animate-pulse" />}>
              <BookingsSection
                element={element}
                isVisible={isVisible}
                onOpenBookingsDialog={onOpenBookingsDialog}
              />
            </Suspense>
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
