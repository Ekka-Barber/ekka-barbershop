
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Database } from "@/types/supabase";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/hooks/use-toast";
import { hasNotch, isRunningAsStandalone, getSafeAreaInsets, getViewportDimensions } from "@/services/platformDetection";
import { CustomerHeader } from "@/components/customer/CustomerHeader";
import { CustomerModals } from "@/components/customer/CustomerModals";
import { UiElementsRenderer } from "@/components/customer/UiElementsRenderer";
import { useLayoutSetup } from "@/hooks/customer/useLayoutSetup";
import { useUiElements } from "@/hooks/customer/useUiElements";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { 
  trackViewContent, 
  trackButtonClick, 
  trackLocationView, 
  trackServiceSelection 
} from "@/utils/tiktokTracking";

// Define Branch interface directly in this file
interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
}

const Customer = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  
  const { 
    viewportHeight,
    safeAreaInsets,
    isStandalone,
    deviceHasNotch
  } = useLayoutSetup();

  useEffect(() => {
    trackViewContent({
      pageId: 'home',
      pageName: 'Home'
    });
  }, []);

  const { data: branches, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw error;
      return data;
    }
  });

  const { 
    visibleElements, 
    refetchUiElements, 
    isLoadingUiElements 
  } = useUiElements();

  const handleBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'book_now',
      buttonName: 'Book Now'
    });
    setBranchDialogOpen(false);
    navigate(`/bookings?branch=${branchId}`);
  };

  const handleEidBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'eid_bookings',
      buttonName: 'Eid Bookings'
    });
    setEidBookingsDialogOpen(false);
    
    if (branches) {
      const selectedBranch = branches.find(branch => branch.id === branchId);
      
      if (selectedBranch) {
        if (selectedBranch.name === "Ash-Sharai" || selectedBranch.name_ar === "الشرائع") {
          window.open("https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=1532757&share&pId=881059", '_blank');
          return;
        } else if (selectedBranch.name === "Al-Waslyia" || selectedBranch.name_ar === "الوصلية") {
          window.open("https://www.fresha.com/ar/book-now/ekka-gspkudll/all-offer?id=935949&share&pId=881059", '_blank');
          return;
        }
      }
    }
    
    toast({
      title: language === 'ar' ? 'خطأ' : 'Error',
      description: language === 'ar' 
        ? 'لم نتمكن من العثور على رابط الحجز لهذا الفرع' 
        : 'Could not find booking link for this branch',
      variant: "destructive"
    });
  };

  const handleLocationClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleLocationDialog = () => {
    setLocationDialogOpen(true);
    if (branches?.[0]) {
      trackLocationView({
        id: branches[0].id,
        name_en: branches[0].name,
        value: undefined
      });
    }
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: language === 'ar' ? 'تم التحديث' : 'Refreshed',
      description: language === 'ar' ? 'تم تحديث المحتوى' : 'Content has been updated',
      duration: 2000,
    });
  };

  const handleButtonClick = (element: any) => {
    trackButtonClick({
      buttonId: element.name,
      buttonName: language === 'ar' ? element.display_name_ar : element.display_name
    });
    
    if (element.action?.startsWith('http')) {
      window.open(element.action, '_blank');
    } else if (element.action === 'openBranchDialog') {
      setBranchDialogOpen(true);
    } else if (element.action === 'openLocationDialog') {
      handleLocationDialog();
    } else if (element.action === 'openEidBookingsDialog') {
      setEidBookingsDialogOpen(true);
    } else if (element.action) {
      navigate(element.action);
    }
  };

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className={`min-h-screen flex flex-col ${isStandalone ? 'pt-14' : 'pt-4'} ${deviceHasNotch ? 'safe-top' : ''}`}>
      <div className="app-container h-full">
        <PullToRefresh onRefresh={handleRefresh}>
          <div 
            ref={contentRef}
            className={`content-area flex flex-col justify-center items-center ${isStandalone ? 'standalone-mode' : ''} ${deviceHasNotch ? 'has-notch' : ''}`}
            style={{
              minHeight: isStandalone ? 
                `calc(100vh - ${safeAreaInsets.top + safeAreaInsets.bottom}px)` : 
                '100vh',
              paddingTop: deviceHasNotch && isStandalone ? 
                `max(env(safe-area-inset-top), ${safeAreaInsets.top}px)` : 
                undefined,
              paddingBottom: deviceHasNotch && isStandalone ? 
                `max(env(safe-area-inset-bottom), ${safeAreaInsets.bottom}px)` : 
                undefined,
            }}
          >
            <CustomerHeader language={language} />

            <div className="space-y-3 md:space-y-4 max-w-xs mx-auto pb-safe">
              <UiElementsRenderer 
                isLoadingUiElements={isLoadingUiElements}
                visibleElements={visibleElements} 
                language={language}
                onButtonClick={handleButtonClick}
                branches={branches}
                setEidBookingsDialogOpen={setEidBookingsDialogOpen}
              />

              <InstallAppPrompt />
            </div>
          </div>
        </PullToRefresh>
      </div>

      <LanguageSwitcher />

      <CustomerModals
        branchDialogOpen={branchDialogOpen}
        setBranchDialogOpen={setBranchDialogOpen}
        locationDialogOpen={locationDialogOpen}
        setLocationDialogOpen={setLocationDialogOpen}
        eidBookingsDialogOpen={eidBookingsDialogOpen}
        setEidBookingsDialogOpen={setEidBookingsDialogOpen}
        branches={branches}
        onBranchSelect={handleBranchSelect}
        onLocationClick={handleLocationClick}
        onEidBranchSelect={handleEidBranchSelect}
      />
      <footer className="page-footer" />
    </div>
  );
};

export default Customer;
