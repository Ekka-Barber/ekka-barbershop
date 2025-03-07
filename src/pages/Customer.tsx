import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Lazy-load non-critical components
const BranchDialog = lazy(() => import("@/components/customer/BranchDialog").then(mod => ({ default: mod.BranchDialog })));
const LocationDialog = lazy(() => import("@/components/customer/LocationDialog").then(mod => ({ default: mod.LocationDialog })));
const InstallAppPrompt = lazy(() => import("@/components/installation/InstallAppPrompt").then(mod => ({ default: mod.InstallAppPrompt })));
const PullToRefresh = lazy(() => import("@/components/common/PullToRefresh").then(mod => ({ default: mod.PullToRefresh })));

const Customer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);

  // Try to use prefetched data first
  const getPrefetchedBranches = () => {
    try {
      const cachedData = sessionStorage.getItem('prefetched_branches');
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (e) {
      return null;
    }
  };

  const { data: branches, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      // Check if we have prefetched data
      const prefetchedData = getPrefetchedBranches();
      if (prefetchedData) return prefetchedData;
      
      // Otherwise fetch from supabase
      const { data, error } = await supabase.from('branches').select('*');
      if (error) throw error;
      return data;
    },
    initialData: getPrefetchedBranches,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Defer non-essential button handlers
  const handleBranchSelect = (branchId: string) => {
    setBranchDialogOpen(false);
    navigate(`/bookings?branch=${branchId}`);
  };

  const handleLocationClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleLocationDialog = () => {
    setLocationDialogOpen(true);
  };

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: language === 'ar' ? 'تم التحديث' : 'Refreshed',
      description: language === 'ar' ? 'تم تحديث المحتوى' : 'Content has been updated',
      duration: 2000,
    });
  };

  useEffect(() => {
    trackViewContent({
      pageId: 'home',
      pageName: 'Home'
    });
  }, []);

  const trackViewContent = ({ pageId, pageName, value, currency = "SAR" }: ViewContentParams) => {
    if (typeof window === 'undefined' || !window.ttq) return;
    
    window.ttq.track('ViewContent', {
      contents: [{
        content_id: pageId,
        content_type: "page",
        content_name: pageName
      }],
      ...(value && { value, currency })
    });
  };

  interface ViewContentParams {
    pageId: string;
    pageName: string;
    value?: number;
    currency?: string;
  }

  const trackButtonClick = ({ buttonId, buttonName, value, currency = "SAR" }: ButtonClickParams) => {
    if (typeof window === 'undefined' || !window.ttq) return;
    
    window.ttq.track('ClickButton', {
      contents: [{
        content_id: buttonId,
        content_type: "button",
        content_name: buttonName
      }],
      ...(value && { value, currency })
    });
  };

  interface ButtonClickParams {
    buttonId: string;
    buttonName: string;
    value?: number;
    currency?: string;
  }

  const trackLocationView = (branch: LocationParams) => {
    if (typeof window === 'undefined' || !window.ttq) return;
    
    window.ttq.track('FindLocation', {
      contents: [{
        content_id: branch.id,
        content_type: "branch",
        content_name: branch.name_en
      }],
      ...(branch.value && { value: branch.value, currency: "SAR" })
    });
  };

  interface LocationParams {
    id: string;
    name_en: string;
    value?: number;
  }

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <div className="app-container">
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading...</div>}>
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="content-area">
              <div className="text-center mb-8">
                <img 
                  src="/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png" 
                  alt="Ekka Barbershop Logo" 
                  className="h-32 mx-auto mb-6 object-contain"
                  loading="eager"
                  fetchpriority="high"
                  width="320" 
                  height="128"
                />
                <div className="space-y-2">
                  <h2 className="text-xl font-medium text-[#222222]">
                    {t('welcome.line1')}
                  </h2>
                  <h1 className="text-3xl font-bold text-[#222222]">
                    {t('welcome.line2')}
                  </h1>
                </div>
                <div className="h-1 w-24 bg-[#C4A36F] mx-auto mt-4"></div>
              </div>

              <div className="space-y-4 max-w-xs mx-auto">
                <Button 
                  className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" 
                  onClick={() => {
                    trackButtonClick({
                      buttonId: 'view_menu',
                      buttonName: 'View Menu'
                    });
                    navigate('/menu');
                  }}
                >
                  {t('view.menu')}
                </Button>
                
                <Button 
                  className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" 
                  onClick={() => {
                    trackButtonClick({
                      buttonId: 'special_offers',
                      buttonName: 'Special Offers'
                    });
                    navigate('/offers');
                  }}
                >
                  {t('special.offers')}
                </Button>

                <Button 
                  className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" 
                  onClick={() => {
                    trackButtonClick({
                      buttonId: 'book_now',
                      buttonName: 'Book Now'
                    });
                    setBranchDialogOpen(true);
                  }}
                >
                  {t('book.now')}
                </Button>

                <Button 
                  className="w-full h-14 text-lg font-medium bg-[#4A4A4A] hover:bg-[#3A3A3A] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target" 
                  onClick={() => {
                    handleLocationDialog();
                    if (branches?.[0]) {
                      trackLocationView({
                        id: branches[0].id,
                        name_en: branches[0].name,
                        value: undefined
                      });
                    }
                  }}
                >
                  <div className={`w-full flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
                    <MapPin className="h-5 w-5" />
                    <span>{language === 'ar' ? 'فروعنا' : 'Our Branches'}</span>
                  </div>
                </Button>

                <Button 
                  className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 touch-target overflow-hidden" 
                  onClick={() => {
                    trackButtonClick({
                      buttonId: 'join_loyalty',
                      buttonName: 'Join Loyalty Program'
                    });
                    window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank');
                  }}
                >
                  <div className={`w-full flex items-center ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'} justify-between gap-2 px-3`}>
                    <span className="font-semibold truncate text-base flex-grow max-w-[75%]">
                      {language === 'ar' ? 'انضم لبرنامج الولاء' : 'Join loyalty program'}
                    </span>
                    <img 
                      src="/lovable-uploads/ba9a65f1-bf31-4b9c-ab41-7c7228a2f1b7.png" 
                      alt="Rescale Logo" 
                      className="h-7 w-auto flex-shrink-0"
                      loading="lazy"
                    />
                  </div>
                </Button>

                <Suspense fallback={null}>
                  <InstallAppPrompt />
                </Suspense>
              </div>
            </div>
          </PullToRefresh>
        </Suspense>
      </div>

      <LanguageSwitcher />

      {/* Lazy loaded dialogs - only render when needed */}
      {branchDialogOpen && (
        <Suspense fallback={null}>
          <BranchDialog 
            open={branchDialogOpen} 
            onOpenChange={setBranchDialogOpen} 
            branches={branches} 
            onBranchSelect={handleBranchSelect} 
          />
        </Suspense>
      )}
      
      {locationDialogOpen && (
        <Suspense fallback={null}>
          <LocationDialog 
            open={locationDialogOpen} 
            onOpenChange={setLocationDialogOpen} 
            branches={branches} 
            onLocationClick={handleLocationClick} 
          />
        </Suspense>
      )}
      
      <footer className="page-footer" />
    </div>
  );
};

export default Customer;
