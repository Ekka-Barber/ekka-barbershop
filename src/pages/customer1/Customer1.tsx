import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Branch } from "@/types/branch";
import { Suspense, useCallback, useEffect, useMemo } from "react";
import { useUIElements } from "@/hooks/useUIElements";
import { useElementAnimation } from "@/hooks/useElementAnimation";
import { useDialogState } from "@/hooks/useDialogState";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { HeroSection } from "./components/HeroSection";
import { FeaturesAndActions } from "./components/FeaturesAndActions";
import { SectionSeparator } from "./components/SectionSeparator";
import { ServicesShowcase } from "./components/ServicesShowcase";
import { BranchShowcase } from "./components/BranchShowcase";
import { ReviewsShowcase } from "./components/ReviewsShowcase";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";
import { Skeleton } from "@/components/ui/skeleton";
import { lazyWithRetry } from "@/utils/lazyWithRetry";

const BranchDialog = lazyWithRetry(() =>
  import("@/components/customer/BranchDialog").then((mod) => ({
    default: mod.BranchDialog,
  }))
);
const LocationDialog = lazyWithRetry(() =>
  import("@/components/customer/LocationDialog").then((mod) => ({
    default: mod.LocationDialog,
  }))
);
const EidBookingsDialog = lazyWithRetry(() =>
  import("@/components/customer/EidBookingsDialog").then((mod) => ({
    default: mod.EidBookingsDialog,
  }))
);

type UiElement = Database["public"]["Tables"]["ui_elements"]["Row"];

const ActionSkeleton = () => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {[0, 1, 2, 3].map((item) => (
      <div
        key={item}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f1f1f]/80 to-[#1a1a1a]/60 p-5 backdrop-blur-sm shadow-[0_20px_50px_-30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/15"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(214,179,90,0.08),_transparent_70%)] opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative flex items-center gap-4">
          <Skeleton className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 shadow-inner" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-4 w-3/4 bg-gradient-to-r from-white/15 via-white/10 to-white/5" />
            <Skeleton className="h-3 w-1/2 bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const Customer1 = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: branches,
    error: branchesError,
    isError: branchesIsError,
    refetch: refetchBranches,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select(
          "id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, google_place_id"
        );
      if (error) throw error;

      return data as Branch[];
    },
  });

  useEffect(() => {
    if (branchesIsError && branchesError) {
      toast({
        title: t("error.occurred"),
        description: t("please.try.again"),
        variant: "destructive",
      });
    }
  }, [branchesIsError, branchesError, t, toast]);

  const {
    visibleElements,
    isLoadingUiElements,
    refetchUiElements,
  } = useUIElements();

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
    handleLocationDialog,
  } = useDialogState(branches);

  const heroPrimaryElement = useMemo(
    () => visibleElements.find((element) => element.name === "book_now"),
    [visibleElements]
  );

  const heroSecondaryElement = useMemo(
    () => visibleElements.find((element) => element.name === "view_menu"),
    [visibleElements]
  );

  const quickActionElements = useMemo(() => {
    const excludedIds = new Set(
      [heroPrimaryElement?.id, heroSecondaryElement?.id].filter(Boolean) as string[]
    );
    return visibleElements.filter(
      (element) => element.type === "button" && !excludedIds.has(element.id)
    );
  }, [visibleElements, heroPrimaryElement?.id, heroSecondaryElement?.id]);

  const loyaltyElement = useMemo(
    () =>
      visibleElements.find(
        (element) => element.type === "section" && element.name === "loyalty_program"
      ),
    [visibleElements]
  );

  const eidElement = useMemo(
    () =>
      visibleElements.find(
        (element) => element.type === "section" && element.name === "eid_bookings"
      ),
    [visibleElements]
  );

  const mainBranch = useMemo(() => {
    if (!branches || branches.length === 0) return null;
    return branches.find((branch) => branch.is_main) ?? branches[0];
  }, [branches]);

  const handleElementAction = useCallback(
    (element: UiElement) => {
      trackButtonClick({
        buttonId: element.name,
        buttonName:
          language === "ar" ? element.display_name_ar : element.display_name,
      });

      if (element.action?.startsWith("http")) {
        window.open(element.action, "_blank");
      } else if (element.action === "openBranchDialog") {
        setBranchDialogOpen(true);
      } else if (element.action === "openLocationDialog") {
        handleLocationDialog();
      } else if (element.action === "openEidBookingsDialog") {
        setEidBookingsDialogOpen(true);
      } else if (element.action) {
        navigate(element.action);
      }
    },
    [
      handleLocationDialog,
      language,
      navigate,
      setBranchDialogOpen,
      setEidBookingsDialogOpen,
    ]
  );

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchUiElements(), refetchBranches()]);
      toast({
        title: t("customer1.refresh.success.title"),
        description: t("customer1.refresh.success.body"),
        duration: 2200,
      });
    } catch {
      toast({
        title: t("error.occurred"),
        description: t("please.try.again"),
        variant: "destructive",
      });
    }
  };

  const handleLoyaltyActivate = useCallback(() => {
    if (!loyaltyElement) return;

    trackButtonClick({
      buttonId: "loyalty_program",
      buttonName:
        language === "ar"
          ? loyaltyElement.display_name_ar
          : loyaltyElement.display_name,
    });

    if (loyaltyElement.action) {
      window.open(loyaltyElement.action, "_blank");
      return;
    }

    const fallbackUrl =
      "https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4";
    window.open(fallbackUrl, "_blank");
  }, [language, loyaltyElement]);

  return (
    <div className="relative min-h-full w-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1f1f1f] text-white">
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute -top-1/4 -left-1/4 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-[#D6B35A]/15 via-[#C79A2A]/10 to-transparent blur-[180px] animate-pulse" />
        <div className="absolute top-1/3 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#4a4a4a]/20 via-[#3a3a3a]/15 to-transparent blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#5a5a5a]/12 via-transparent to-transparent blur-[120px]" />
        
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(214,179,90,0.08),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(100,100,100,0.12),_transparent_60%)]" />
      </div>

      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms
        refreshIndicatorColor="#D6B35A"
        backgroundColor="rgba(26,26,26,0.95)"
      >
        <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-10 px-5 pb-24 pt-16 sm:gap-12 sm:px-8 sm:pt-20">
          {/* Content wrapper with depth */}
          <div className="relative z-10 flex flex-col gap-10 sm:gap-12">
            <HeroSection
              onPrimaryAction={
                heroPrimaryElement
                  ? () => handleElementAction(heroPrimaryElement)
                  : undefined
              }
              onSecondaryAction={
                heroSecondaryElement
                  ? () => handleElementAction(heroSecondaryElement)
                  : undefined
              }
            />

            <SectionSeparator />

            {isLoadingUiElements ? (
              <ActionSkeleton />
            ) : (
              <FeaturesAndActions
                actions={quickActionElements}
                animatingElements={animatingElements}
                onAction={handleElementAction}
              />
            )}

            <SectionSeparator />

            <ServicesShowcase
              loyaltyElement={loyaltyElement}
              eidElement={eidElement}
              onLoyaltyActivate={handleLoyaltyActivate}
              onOpenEidDialog={() => setEidBookingsDialogOpen(true)}
            />

            <SectionSeparator />

            <BranchShowcase
              mainBranch={mainBranch}
              onViewAllBranches={handleLocationDialog}
              onOpenMaps={handleLocationClick}
            />

            <SectionSeparator />

            <ReviewsShowcase />
          </div>
        </div>
      </PullToRefresh>

      <LanguageSwitcher />

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

      <InstallAppPrompt />
    </div>
  );
};

export default Customer1;
