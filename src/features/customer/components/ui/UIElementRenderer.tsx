import { useCallback, Suspense } from "react";
import { lazy } from "react";
import { useNavigate } from "react-router-dom";

import type { Tables } from "@shared/types/supabase";
import { trackButtonClick } from "@shared/utils/tiktokTracking";

import { ActionButton } from "./ActionButton";

import { useLanguage } from "@/contexts/LanguageContext";

type UiElement = Tables<'ui_elements'>;

// Lazy load heavy section components using regular lazy
const LoyaltySection = lazy(() => import("../sections/LoyaltySection"));
const BookingsSection = lazy(() => import("../sections/BookingsSection"));
const EidBookingsSection = lazy(() => import("../sections/EidBookingsSection"));
const GoogleReviewsWrapper = lazy(() => import("../sections/GoogleReviewsWrapper"));

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
            <Suspense key={element.id} fallback={
              <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-white/10 rounded w-24"></div>
                  <div className="h-6 bg-white/10 rounded w-16"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-3/4"></div>
                  <div className="h-8 bg-brand-gold-200/20 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            }>
              <BookingsSection
                element={element}
                isVisible={isVisible}
                onOpenBookingsDialog={onOpenBookingsDialog}
              />
            </Suspense>
          );
        } else if (element.type === 'section' && element.name === 'eid_bookings') {
          return (
            <Suspense key={element.id} fallback={
              <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 bg-white/10 rounded w-28"></div>
                  <div className="h-6 bg-white/10 rounded w-20"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-2/3"></div>
                  <div className="h-8 bg-brand-gold-200/20 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            }>
              <EidBookingsSection
                element={element}
                isVisible={isVisible}
                onOpenEidDialog={onOpenEidDialog}
              />
            </Suspense>
          );
        } else if (element.type === 'section' && element.name === 'loyalty_program') {
          return (
            <Suspense key={element.id} fallback={
              <div className="h-32 rounded-2xl border border-white/10 bg-white/[0.02] p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 bg-white/10 rounded-full"></div>
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-4/5"></div>
                  <div className="h-8 bg-brand-gold-200/20 rounded-xl w-full mt-4"></div>
                </div>
              </div>
            }>
              <LoyaltySection
                element={element}
                isVisible={isVisible}
              />
            </Suspense>
          );
        } else if (element.type === 'section' && element.name === 'google_reviews') {
          return (
            <Suspense key={element.id} fallback={
              <div className="h-20 rounded-2xl border border-white/10 bg-white/[0.02] p-4 animate-pulse">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-3 w-3 bg-brand-gold-200/30 rounded"></div>)}
                  </div>
                  <div className="h-3 bg-white/10 rounded w-16"></div>
                </div>
                <div className="h-3 bg-white/10 rounded w-full"></div>
              </div>
            }>
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
