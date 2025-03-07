
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MapPin } from "lucide-react";
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";
import { trackViewContent, trackButtonClick, trackLocationView } from "@/utils/tiktokTracking";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import { hasNotch, isRunningAsStandalone } from "@/services/platformDetection";

const Customer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const isStandalone = isRunningAsStandalone();
  const deviceHasNotch = hasNotch();

  // Update viewport height on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Force a resize after a slight delay to ensure all dimensions are correct
    const timeoutId = setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

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

  const handleBranchSelect = (branchId: string) => {
    trackButtonClick({
      buttonId: 'book_now',
      buttonName: 'Book Now'
    });
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

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-screen flex flex-col">
      <div className="app-container h-full">
        <PullToRefresh onRefresh={handleRefresh}>
          <div className={`content-area pwa-content-fix ${isStandalone ? 'standalone-mode' : ''} ${deviceHasNotch ? 'has-notch' : ''}`}>
            <div className="flex flex-col justify-center min-h-dynamic-viewport">
              <div className="text-center mb-6 md:mb-8 mt-auto pt-4">
                <img 
                  src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png" 
                  alt="Ekka Barbershop Logo" 
                  className="h-28 md:h-32 mx-auto mb-4 md:mb-6 object-contain"
                  loading="eager"
                  width="320" 
                  height="128"
                />
                <div className="space-y-1 md:space-y-2">
                  <h2 className="text-xl font-medium text-[#222222]">
                    {t('welcome.line1')}
                  </h2>
                  <h1 className="text-2xl md:text-3xl font-bold text-[#222222]">
                    {t('welcome.line2')}
                  </h1>
                </div>
                <div className="h-1 w-24 bg-[#C4A36F] mx-auto mt-3 md:mt-4"></div>
              </div>

              <div className="space-y-3 md:space-y-4 max-w-xs mx-auto mb-auto pb-4">
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
                  onClick={handleLocationDialog}
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
                    <img src="/lovable-uploads/ba9a65f1-bf31-4b9c-ab41-7c7228a2f1b7.png" alt="Rescale Logo" className="h-7 w-auto flex-shrink-0" />
                  </div>
                </Button>

                <InstallAppPrompt />
              </div>
            </div>
          </div>
        </PullToRefresh>
      </div>

      <LanguageSwitcher />

      <BranchDialog open={branchDialogOpen} onOpenChange={setBranchDialogOpen} branches={branches} onBranchSelect={handleBranchSelect} />
      <LocationDialog open={locationDialogOpen} onOpenChange={setLocationDialogOpen} branches={branches} onLocationClick={handleLocationClick} />
      <footer className="page-footer" />
    </div>
  );
};

export default Customer;
