// @ts-nocheck
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import AppLayout from '@/components/layout/AppLayout';
import { Branch } from "@/types/branch";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

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



const Customer = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

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
      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms={true}
      >
        <div className="flex flex-1 flex-col justify-start items-center w-full max-w-md mx-auto pb-40">
          {/* Header section with logo and welcome text */}
          <CustomerHeader animatingElements={animatingElements} />

          {/* UI Elements section */}
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

          <InstallAppPrompt />
        </div>
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

export default Customer;
