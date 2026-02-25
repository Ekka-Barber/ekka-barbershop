import { useQuery } from "@tanstack/react-query";
import { Suspense, useEffect, type ComponentType } from "react";
import { Link } from "react-router-dom";

import { InstallAppPrompt } from "@features/customer/components/installation/InstallAppPrompt";
import { CustomerHeader } from "@features/customer/components/layout/CustomerHeader";
import { UIElementRenderer } from "@features/customer/components/ui/UIElementRenderer";

import { ENTRANCE_ANIMATIONS, ANIMATION_PERFORMANCE } from "@shared/constants/animations";
import { useDialogState } from "@shared/hooks/useDialogState";
import { useElementAnimation } from "@shared/hooks/useElementAnimation";
import { useMarketingDialog } from "@shared/hooks/useMarketingDialog";
import { useMotionPreferences } from "@shared/hooks/useMotionPreferences";
import { useUIElements } from "@shared/hooks/useUIElements";
import { motion } from "@shared/lib/motion";
import { supabase } from "@shared/lib/supabase/client";
import { Branch } from "@shared/types/branch";
import { Card, CardContent } from "@shared/ui/components/card";
import { AnimatedBackground } from "@shared/ui/components/common/AnimatedBackground";
import { AnimatedSection } from "@shared/ui/components/common/AnimatedSection";
import { LanguageSwitcher } from "@shared/ui/components/common/LanguageSwitcher";
import AppLayout from '@shared/ui/components/layout/AppLayout';
import { Separator } from "@shared/ui/components/separator";
import { useToast } from "@shared/ui/components/use-toast";
import { lazyWithRetry } from "@shared/utils/lazyWithRetry";

import { useLanguage } from "@/contexts/LanguageContext";


// Import our extracted components

// Import our custom hooks

// Lazy load heavy dialog components for better bundle optimization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BranchDialog = lazyWithRetry(() => import("@features/customer/components/BranchDialog").then(mod => ({ default: mod.BranchDialog as ComponentType<any> })) as Promise<{ default: ComponentType<any> }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LocationDialog = lazyWithRetry(() => import("@features/customer/components/LocationDialog").then(mod => ({ default: mod.LocationDialog as ComponentType<any> })) as Promise<{ default: ComponentType<any> }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BookingsDialog = lazyWithRetry(() => import("@features/customer/components/BookingsDialog").then(mod => ({ default: mod.default as ComponentType<any> })) as Promise<{ default: ComponentType<any> }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EidBookingsDialog = lazyWithRetry(() => import("@features/customer/components/EidBookingsDialog").then(mod => ({ default: mod.default as ComponentType<any> })) as Promise<{ default: ComponentType<any> }>);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LazyMarketingDialog = lazyWithRetry(() => import("@shared/ui/components/common/LazyMarketingDialog").then(mod => ({ default: mod.LazyMarketingDialog as ComponentType<any> })) as Promise<{ default: ComponentType<any> }>);

const Customer1 = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const prefersReducedMotion = useMotionPreferences();

  // Page component logic

  // Get branches data
  const { data: branches, error: branchesError, isError: branchesIsError } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, google_place_id');
      if (error) throw error;

      return data as Branch[];
    }
  });

  // Show error toast when branches fail to load
  useEffect(() => {
    if (branchesIsError && branchesError) {
      toast({
        title: t('error.occurred'),
        description: t('please.try.again'),
        variant: "destructive"
      });
    }
  }, [branchesIsError, branchesError, t, toast]);

  // Use our custom hooks
  const { visibleElements, isLoadingUiElements } = useUIElements();

  const { animatingElements } = useElementAnimation(visibleElements);
  const {
    branchDialogOpen,
    setBranchDialogOpen,
    bookingsDialogOpen,
    setBookingsDialogOpen,
    eidBookingsDialogOpen,
    setEidBookingsDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    handleBranchSelect,
    handleBranchSelectForBookings,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  } = useDialogState(branches);

  // Marketing dialog for menus and offers
  const {
    dialogState: marketingDialogState,
    openMarketingDialog,
    closeMarketingDialog,
    menuContent,
    offersContent,
    menuLoading,
    offersLoading
  } = useMarketingDialog();

  return (
    <AppLayout>
      {/* Enhanced Background Effects */}
      <AnimatedBackground prefersReducedMotion={prefersReducedMotion} />

      <motion.div
        className="flex flex-1 flex-col justify-start items-center w-full max-w-md mx-auto pb-40 relative z-0"
        style={{
          willChange: prefersReducedMotion ? ANIMATION_PERFORMANCE.WILL_CHANGE.AUTO : ANIMATION_PERFORMANCE.WILL_CHANGE.TRANSFORM_OPACITY,
          backfaceVisibility: ANIMATION_PERFORMANCE.HARDWARE_ACCELERATION.BACKFACE_VISIBILITY
        }}
        initial={prefersReducedMotion ? {} : ENTRANCE_ANIMATIONS.MAIN_CONTAINER.initial}
        animate={prefersReducedMotion ? {} : ENTRANCE_ANIMATIONS.MAIN_CONTAINER.animate}
        transition={{
          duration: ENTRANCE_ANIMATIONS.MAIN_CONTAINER.duration,
          ease: ENTRANCE_ANIMATIONS.MAIN_CONTAINER.ease
        }}
      >
        {/* Enhanced Header section */}
        <AnimatedSection
          animationType="HEADER"
          prefersReducedMotion={prefersReducedMotion}
          className="w-full mb-6"
        >
          <Card className="border-2 border-white/20 bg-gradient-to-br from-white/[0.15] to-white/[0.05] backdrop-blur-2xl shadow-[0_50px_100px_-30px_rgba(0,0,0,0.5),0_15px_40px_-10px_rgba(232,198,111,0.2),inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-500 hover:shadow-[0_70px_120px_-40px_rgba(0,0,0,0.6),0_20px_50px_-15px_rgba(232,198,111,0.3)] !bg-none">
            <CardContent className="p-0">
              <CustomerHeader animatingElements={animatingElements} />
            </CardContent>
          </Card>

          <LanguageSwitcher className="sticky top-4 right-4 -mt-8" />
        </AnimatedSection>


        {/* UI Elements section with enhanced styling */}
        <AnimatedSection
          animationType="UI_ELEMENTS"
          prefersReducedMotion={prefersReducedMotion}
          className="w-full space-y-4"
        >
          <UIElementRenderer
            visibleElements={visibleElements}
            animatingElements={animatingElements}
            isLoadingUiElements={isLoadingUiElements}
            onOpenBranchDialog={() => setBranchDialogOpen(true)}
            onOpenLocationDialog={() => handleLocationDialog()}
            onOpenBookingsDialog={() => setBookingsDialogOpen(true)}
            onOpenEidDialog={() => setEidBookingsDialogOpen(true)}
            onOpenMarketingDialog={openMarketingDialog}
          />
        </AnimatedSection>

        {/* Enhanced separator */}
        <AnimatedSection
          animationType="SEPARATOR"
          prefersReducedMotion={prefersReducedMotion}
          className="w-full max-w-xs mx-auto my-6"
          style={{ transformOrigin: 'center' }}
        >
          <Separator className="bg-gradient-to-r from-transparent via-brand-gold-200/40 to-transparent h-[2px] shadow-[0_0_20px_rgba(232,198,111,0.3)]" />
        </AnimatedSection>

        {/* Enhanced InstallAppPrompt */}
        <AnimatedSection
          animationType="INSTALL_PROMPT"
          prefersReducedMotion={prefersReducedMotion}
        >
          <InstallAppPrompt />
        </AnimatedSection>

        {/* Footer with Policy Links - Google Ads Compliance */}
        <footer className="mt-8 py-6 border-t border-white/10">
          <div className="max-w-xs mx-auto text-center space-y-3">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/privacy"
                className="text-white/70 hover:text-brand-gold-200 transition-colors"
              >
                {t('footer.privacy')}
              </Link>
              <Link
                to="/terms"
                className="text-white/70 hover:text-brand-gold-200 transition-colors"
              >
                {t('footer.terms')}
              </Link>
              <Link
                to="/refund"
                className="text-white/70 hover:text-brand-gold-200 transition-colors"
              >
                {t('footer.refund')}
              </Link>
              <Link
                to="/contact"
                className="text-white/70 hover:text-brand-gold-200 transition-colors"
              >
                {t('footer.contact')}
              </Link>
            </div>
            <p className="text-white/50 text-xs">
              {t('footer.copyright')}
            </p>
          </div>
        </footer>
      </motion.div>

      {/* Lazy-loaded Dialogs with Suspense */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold-200 border-t-transparent" /></div>}>
        <BranchDialog
          open={branchDialogOpen}
          onOpenChange={setBranchDialogOpen}
          onBranchSelect={handleBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold-200 border-t-transparent" /></div>}>
        <LocationDialog
          open={locationDialogOpen}
          onOpenChange={setLocationDialogOpen}
          onLocationClick={handleLocationClick}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold-200 border-t-transparent" /></div>}>
        <BookingsDialog
          open={bookingsDialogOpen}
          onOpenChange={setBookingsDialogOpen}
          onBranchSelect={handleBranchSelectForBookings}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold-200 border-t-transparent" /></div>}>
        <EidBookingsDialog
          open={eidBookingsDialogOpen}
          onOpenChange={setEidBookingsDialogOpen}
          onBranchSelect={handleEidBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      {/* Marketing Dialog for Menus and Offers */}
      <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold-200 border-t-transparent" /></div>}>
        <LazyMarketingDialog
          open={marketingDialogState.open}
          onOpenChange={closeMarketingDialog}
          contentType={marketingDialogState.contentType}
          initialContent={marketingDialogState.contentType === 'menu'
            ? menuContent
            : offersContent}
          initialIndex={marketingDialogState.currentIndex}
          isLoading={marketingDialogState.contentType === 'menu' ? menuLoading : offersLoading}
        />
      </Suspense>
    </AppLayout>
  );
};

export default Customer1;
