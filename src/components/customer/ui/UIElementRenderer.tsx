
import { useCallback, Suspense, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/integrations/supabase/types";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { ActionButton } from "./ActionButton";

type UiElement = Database['public']['Tables']['ui_elements']['Row'];

// Lazy load heavy section components - now loaded on-demand only
const loadLoyaltySection = () => import("../sections/LoyaltySection");
const loadBookingsSection = () => import("../sections/BookingsSection");
const loadEidBookingsSection = () => import("../sections/EidBookingsSection");
const loadGoogleReviewsWrapper = () => import("../sections/GoogleReviewsWrapper");

// Components are now loaded lazily when actually needed
const LoyaltySection = lazyWithRetry(loadLoyaltySection);
const BookingsSection = lazyWithRetry(loadBookingsSection);
const EidBookingsSection = lazyWithRetry(loadEidBookingsSection);
const GoogleReviewsWrapper = lazyWithRetry(loadGoogleReviewsWrapper);

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

  // Track which sections have been loaded to avoid duplicate loading
  const [loadedSections, setLoadedSections] = useState<Set<string>>(new Set());
  const preloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Visibility-based preloading: only load sections that are actually visible
  useEffect(() => {
    if (animatingElements.length === 0) return;

    // Clear any existing preload timeout
    if (preloadTimeoutRef.current) {
      clearTimeout(preloadTimeoutRef.current);
    }

    // Preload sections that are currently animating (visible) immediately
    const sectionsToLoad = visibleElements
      .filter(element => animatingElements.includes(element.id) && element.type === 'section')
      .map(element => element.name);

        sectionsToLoad.forEach(sectionName => {
      if (!loadedSections.has(sectionName)) {
        // Load the section component
        switch (sectionName) {
          case 'loyalty_program':
            loadLoyaltySection().catch(console.error);
            break;
          case 'bookings':
            loadBookingsSection().catch(console.error);
            break;
          case 'eid_bookings':
            loadEidBookingsSection().catch(console.error);
            break;
          case 'google_reviews':
            loadGoogleReviewsWrapper().catch(console.error);
            break;
        }
        setLoadedSections(prev => new Set(prev).add(sectionName));
      }
    });

    // For non-visible sections, add a small delay before preloading (for smoother UX)
    const nonVisibleSections = visibleElements
      .filter(element => !animatingElements.includes(element.id) && element.type === 'section')
      .map(element => element.name);

    if (nonVisibleSections.length > 0) {
      preloadTimeoutRef.current = setTimeout(() => {
        nonVisibleSections.forEach(sectionName => {
          if (!loadedSections.has(sectionName)) {
            switch (sectionName) {
              case 'loyalty_program':
                loadLoyaltySection().catch(console.error);
                break;
              case 'bookings':
                loadBookingsSection().catch(console.error);
                break;
              case 'eid_bookings':
                loadEidBookingsSection().catch(console.error);
                break;
              case 'google_reviews':
                loadGoogleReviewsWrapper().catch(console.error);
                break;
            }
            setLoadedSections(prev => new Set(prev).add(sectionName));
          }
        });
      }, 1000); // 1 second delay for non-visible sections
    }

    return () => {
      if (preloadTimeoutRef.current) {
        clearTimeout(preloadTimeoutRef.current);
      }
    };
  }, [animatingElements, visibleElements, loadedSections]);

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
