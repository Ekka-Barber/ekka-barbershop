import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from '@/services/supabaseService';
import { trackViewContent } from "@/utils/tiktokTracking";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import type { Branch } from "@/types/branch";

// Import our extracted components
import { CustomerHeader } from "@/components/customer/layout/CustomerHeader";
import { UIElementRenderer } from "@/components/customer/ui/UIElementRenderer";

// Import our custom hooks
import { useUIElements } from "@/hooks/useUIElements";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { useDialogState } from "@/hooks/useDialogState";

// Lazy load heavy dialog components for better bundle optimization
const BranchDialog = lazy(() => import("@/components/customer/BranchDialog").then(mod => ({ default: mod.BranchDialog })));
const LocationDialog = lazy(() => import("@/components/customer/LocationDialog").then(mod => ({ default: mod.LocationDialog })));
const EidBookingsDialog = lazy(() => import("@/components/customer/EidBookingsDialog").then(mod => ({ default: mod.EidBookingsDialog })));
const InstallAppPrompt = lazy(() => import("@/components/installation/InstallAppPrompt").then(mod => ({ default: mod.InstallAppPrompt })));



const Customer = () => {
  const { t } = useLanguage();

  // Track page view
  useEffect(() => {
    trackViewContent({
      pageId: 'home',
      pageName: 'Home'
    });
  }, []);

  // Get branches data
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const supabase = await getSupabaseClient();
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, google_place_id');
      if (error) throw error;

      return data as Branch[];
    }
  });

  // Use our custom hooks
  const { visibleElements, isLoadingUiElements, handleRefresh } = useUIElements();
  const { animatingElements } = useElementAnimation(visibleElements);
  const { 
    branchDialogOpen, 
    setBranchDialogOpen,
    eidBookingsDialogOpen, 
    setEidBookingsDialogOpen,
    locationDialogOpen, 
    setLocationDialogOpen,
    mapDialogOpen, 
    setMapDialogOpen,
    selectedBranch,
    handleBranchSelect,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  } = useDialogState(branches);

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
            onOpenEidDialog={() => setEidBookingsDialogOpen(true)}
          />
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
        <EidBookingsDialog
          open={eidBookingsDialogOpen}
          onOpenChange={setEidBookingsDialogOpen}
          onBranchSelect={handleEidBranchSelect}
          branches={branches || []}
        />
      </Suspense>
      
      <Dialog open={mapDialogOpen} onOpenChange={setMapDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedBranch?.name}</DialogTitle>
            <DialogDescription>{selectedBranch?.address}</DialogDescription>
          </DialogHeader>
          <Button onClick={() => handleLocationClick(selectedBranch ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBranch.address)}` : null)}>
            {t('open.maps')}
          </Button>
        </DialogContent>
      </Dialog>

      <Suspense fallback={null}>
        <InstallAppPrompt />
      </Suspense>
    </AppLayout>
  );
};

export default Customer;
