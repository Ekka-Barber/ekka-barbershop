import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from '@/components/layout/AppLayout';
import { Branch } from "@/types/branch";
import { Link } from "react-router-dom";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { motion } from "@/lib/motion";
import { AnimatedBackground } from "@/components/common/AnimatedBackground";
import { AnimatedSection } from "@/components/common/AnimatedSection";
import { useMotionPreferences } from "@/hooks/useMotionPreferences";
import { ENTRANCE_ANIMATIONS, ANIMATION_PERFORMANCE } from "@/constants/animations";

// Import our extracted components
import { CustomerHeader } from "@/components/customer/layout/CustomerHeader";
import { UIElementRenderer } from "@/components/customer/ui/UIElementRenderer";

// Import our custom hooks
import { useUIElements } from "@/hooks/useUIElements";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { useDialogState } from "@/hooks/useDialogState";
import { useMarketingDialog } from "@/hooks/useMarketingDialog";

// Lazy load heavy dialog components for better bundle optimization
const BranchDialog = lazyWithRetry(() => import("@/components/customer/BranchDialog").then(mod => ({ default: mod.BranchDialog })));
const LocationDialog = lazyWithRetry(() => import("@/components/customer/LocationDialog").then(mod => ({ default: mod.LocationDialog })));
const BookingsDialog = lazyWithRetry(() => import("@/components/customer/BookingsDialog"));
const EidBookingsDialog = lazyWithRetry(() => import("@/components/customer/EidBookingsDialog"));
const LazyMarketingDialog = lazyWithRetry(() => import("@/components/common/LazyMarketingDialog").then(mod => ({ default: mod.LazyMarketingDialog })));

// Import InstallAppPrompt normally to avoid React context issues
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";

const Customer1 = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const prefersReducedMotion = useMotionPreferences();

  // Page component logic

  // Get branches data
  const { data: branches, error: branchesError, isError: branchesIsError, refetch: refetchBranches } = useQuery({
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
  const { visibleElements, isLoadingUiElements, refetchUiElements } = useUIElements();

  // Combined refresh function for pull-to-refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetchUiElements(),
        refetchBranches()
      ]);
      toast({
        title: t('loading'),
        description: 'Content has been updated',
        duration: 2000,
      });
    } catch {
      toast({
        title: t('error.occurred'),
        description: t('please.try.again'),
        variant: "destructive"
      });
    }
  };
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

      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms={true}
        refreshIndicatorColor="#D6B35A"
        backgroundColor="rgba(26,26,26,0.95)"
      >
        <motion.div
          className="flex flex-1 flex-col justify-start items-center w-full max-w-md mx-auto pb-40 relative z-10"
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
            <Card className="border-2 border-white/15 bg-gradient-to-br from-white/[0.12] to-white/[0.06] backdrop-blur-2xl shadow-[0_40px_100px_-40px_rgba(0,0,0,0.8),0_15px_40px_-15px_rgba(214,179,90,0.2),inset_0_1px_2px_rgba(255,255,255,0.15)]">
              <CardContent className="p-0">
                <CustomerHeader animatingElements={animatingElements} />
              </CardContent>
            </Card>
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
            style={{ originX: 0.5 }}
          >
            <Separator className="bg-gradient-to-r from-transparent via-[#E8C66F]/40 to-transparent h-[2px] shadow-[0_0_20px_rgba(232,198,111,0.3)]" />
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
                  className="text-white/70 hover:text-[#E8C66F] transition-colors"
                >
                  {t('footer.privacy')}
                </Link>
                <Link
                  to="/terms"
                  className="text-white/70 hover:text-[#E8C66F] transition-colors"
                >
                  {t('footer.terms')}
                </Link>
                <Link
                  to="/refund"
                  className="text-white/70 hover:text-[#E8C66F] transition-colors"
                >
                  {t('footer.refund')}
                </Link>
                <Link
                  to="/contact"
                  className="text-white/70 hover:text-[#E8C66F] transition-colors"
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

      </PullToRefresh>

      <LanguageSwitcher />

      {/* Lazy-loaded Dialogs with Suspense */}
      <Suspense fallback={null}>
        <BranchDialog
          open={branchDialogOpen}
          onOpenChange={setBranchDialogOpen}
          onBranchSelect={handleBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <LocationDialog
          open={locationDialogOpen}
          onOpenChange={setLocationDialogOpen}
          onLocationClick={handleLocationClick}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <BookingsDialog
          open={bookingsDialogOpen}
          onOpenChange={setBookingsDialogOpen}
          onBranchSelect={handleBranchSelectForBookings}
          branches={branches || []}
        />
      </Suspense>

      <Suspense fallback={null}>
        <EidBookingsDialog
          open={eidBookingsDialogOpen}
          onOpenChange={setEidBookingsDialogOpen}
          onBranchSelect={handleEidBranchSelect}
          branches={branches || []}
        />
      </Suspense>

      {/* Marketing Dialog for Menus and Offers */}
      <Suspense fallback={null}>
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
