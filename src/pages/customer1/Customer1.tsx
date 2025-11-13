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
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { motion } from "@/lib/motion";

// Import our extracted components
import { CustomerHeader } from "@/components/customer/layout/CustomerHeader";
import { UIElementRenderer } from "@/components/customer/ui/UIElementRenderer";

// Import our custom hooks
import { useUIElements } from "@/hooks/useUIElements";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { useDialogState } from "@/hooks/useDialogState";

// Lazy load heavy dialog components for better bundle optimization
const BranchDialog = lazyWithRetry(() => import("@/components/customer/BranchDialog").then(mod => ({ default: mod.BranchDialog })));
const LocationDialog = lazyWithRetry(() => import("@/components/customer/LocationDialog").then(mod => ({ default: mod.LocationDialog })));
const EidBookingsDialog = lazyWithRetry(() => import("@/components/customer/EidBookingsDialog").then(mod => ({ default: mod.EidBookingsDialog })));

// Import InstallAppPrompt normally to avoid React context issues
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";

const Customer1 = () => {
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
    eidBookingsDialogOpen,
    setEidBookingsDialogOpen,
    locationDialogOpen,
    setLocationDialogOpen,
    handleBranchSelect,
    handleEidBranchSelect,
    handleLocationClick,
    handleLocationDialog
  } = useDialogState(branches);

  return (
    <AppLayout>
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-[#D6B35A]/25 via-[#C79A2A]/20 to-transparent blur-[180px]"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/3 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#2a2a2a]/30 via-[#1a1a1a]/25 to-transparent blur-[150px]"
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.25, 0.35, 0.25]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#3a3a3a]/20 via-transparent to-transparent blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.08, 0.15]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Ambient light rays */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(214,179,90,0.12),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(50,50,50,0.18),_transparent_60%)]" />
      </div>

      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms={true}
        refreshIndicatorColor="#D6B35A"
        backgroundColor="rgba(26,26,26,0.95)"
      >
        <motion.div
          className="flex flex-1 flex-col justify-start items-center w-full max-w-md mx-auto pb-40 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Enhanced Header section */}
          <motion.div
            className="w-full mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md shadow-2xl">
              <CardContent className="p-0">
                <CustomerHeader animatingElements={animatingElements} />
              </CardContent>
            </Card>
          </motion.div>


          {/* UI Elements section with enhanced styling */}
          <motion.div
            className="w-full space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <UIElementRenderer
              visibleElements={visibleElements}
              animatingElements={animatingElements}
              isLoadingUiElements={isLoadingUiElements}
              onOpenBranchDialog={() => setBranchDialogOpen(true)}
              onOpenLocationDialog={() => handleLocationDialog()}
              onOpenEidDialog={() => setEidBookingsDialogOpen(true)}
            />
          </motion.div>

          {/* Enhanced separator */}
          <motion.div
            className="w-full max-w-xs mx-auto my-6"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            style={{ originX: 0.5 }}
          >
            <Separator className="bg-gradient-to-r from-transparent via-[#D6B35A]/30 to-transparent h-[1px]" />
          </motion.div>

          {/* Enhanced InstallAppPrompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <InstallAppPrompt />
          </motion.div>
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
        <EidBookingsDialog
          open={eidBookingsDialogOpen}
          onOpenChange={setEidBookingsDialogOpen}
          onBranchSelect={handleEidBranchSelect}
          branches={branches || []}
        />
      </Suspense>
    </AppLayout>
  );
};

export default Customer1;
