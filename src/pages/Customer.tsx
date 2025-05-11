import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";
import { EidBookingsDialog } from "@/components/customer/EidBookingsDialog";
import { trackViewContent } from "@/utils/tiktokTracking";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AppLayout from '@/components/layout/AppLayout';
import { Branch } from "@/types/branch";
import { transformWorkingHours } from "@/utils/workingHoursUtils";

// Import our extracted components
import { CustomerHeader } from "@/components/customer/layout/CustomerHeader";
import { UIElementRenderer } from "@/components/customer/ui/UIElementRenderer";

// Import our custom hooks
import { useUIElements } from "@/hooks/useUIElements";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { useDialogState } from "@/hooks/useDialogState";

// Add the interface near the top of the file
interface UIElementRendererProps {
  elements: UIElement[];
  animatingElements: string[];
  isLoading: boolean;
  onOpenBranchDialog: () => void;
  onOpenLocationDialog: () => void;
  onOpenEidDialog: () => void;
}

const Customer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // Track page view
  useEffect(() => {
    trackViewContent({
      pageId: 'home',
      pageName: 'Home'
    });
  }, []);

  // Get branches data
  const { data: branches, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, working_hours, google_place_id');
      if (error) throw error;
      
      return data?.map(branch => ({
        ...branch,
        working_hours: transformWorkingHours(branch.working_hours) || {}
      })) as Branch[];
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

  const handleOpenBranchDialog = () => {
    setBranchDialogOpen(true);
  };

  const handleOpenLocationDialog = () => {
    handleLocationDialog();
  };

  const handleOpenEidDialog = () => {
    setEidBookingsDialogOpen(true);
  };

  // Make sure the UIElementRenderer component accepts the props we're passing
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
            elements={visibleElements} 
            animatingElements={animatingElements}
            isLoading={isLoadingUiElements}
            onOpenBranchDialog={handleOpenBranchDialog}
            onOpenLocationDialog={handleOpenLocationDialog}
            onOpenEidDialog={handleOpenEidDialog}
          />
        </div>
      </PullToRefresh>

      <LanguageSwitcher />

      {/* Dialogs */}
      <BranchDialog
        open={branchDialogOpen}
        onOpenChange={setBranchDialogOpen}
        onBranchSelect={handleBranchSelect}
        branches={branches || []}
      />
      <LocationDialog
        open={locationDialogOpen}
        onOpenChange={setLocationDialogOpen}
        onLocationClick={handleLocationClick}
        branches={branches || []}
      />
      <EidBookingsDialog
        open={eidBookingsDialogOpen}
        onOpenChange={setEidBookingsDialogOpen}
        onBranchSelect={handleEidBranchSelect}
        branches={branches || []}
      />
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

      <InstallAppPrompt />
    </AppLayout>
  );
};

export default Customer;
