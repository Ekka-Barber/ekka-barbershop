import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, Database } from "@/types/supabase";
import { MapPin } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";
import { EidBookingsDialog } from "@/components/customer/EidBookingsDialog";
import { trackViewContent, trackButtonClick, trackLocationView } from "@/utils/tiktokTracking";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import { hasNotch, isRunningAsStandalone, getSafeAreaInsets, getViewportDimensions } from "@/services/platformDetection";
import freshaLogo from "@/assets/fresha-logo.svg";
import boonusLogo from "@/assets/boonus-logo.svg";
import GoogleReviews from "@/components/customer/GoogleReviews";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define Branch interface directly in this file
interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
}

const renderIcon = (iconName: string | null) => {
  if (!iconName) return null;
  const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
  return Icon ? <Icon className="mr-2 h-5 w-5" /> : null;
};

const Customer = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [eidBookingsDialogOpen, setEidBookingsDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 });
  const contentRef = useRef<HTMLDivElement>(null);
  const isStandalone = isRunningAsStandalone();
  const deviceHasNotch = hasNotch();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const { height } = getViewportDimensions();
      setViewportHeight(height);
      
      const insets = getSafeAreaInsets();
      setSafeAreaInsets({
        top: parseInt(insets.top || '0', 10),
        bottom: parseInt(insets.bottom || '0', 10)
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const timeoutIds = [
      setTimeout(handleResize, 100),
      setTimeout(handleResize, 500),
      setTimeout(handleResize, 1000)
    ];

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [deviceHasNotch, isStandalone]);

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

  const { data: uiElements, refetch: refetchUiElements, isLoading: isLoadingUiElements } = useQuery({
    queryKey: ['ui-elements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ui_elements')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error("Error fetching UI elements:", error);
        throw error;
      }
      console.log("[Customer Page] Raw UI Elements Fetched:", data);
      return data as Database['public']['Tables']['ui_elements']['Row'][];
    }
  });

  const visibleElements = useMemo(() => {
    if (!uiElements) return [];
    const filtered = uiElements.filter(el => el.is_visible);
    console.log("[Customer Page] Visible UI Elements (After Filter):", filtered);
    return filtered;
  }, [uiElements]);

  useEffect(() => {
    const channel = supabase
      .channel('ui_elements_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ui_elements'
        },
        () => {
          refetchUiElements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchUiElements]);

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
            <div className="text-center flex-shrink-0 mx-auto pt-safe">
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
              <div className="h-1 w-24 bg-[#C4A36F] mx-auto mt-3 md:mt-4 mb-6"></div>
            </div>

            <div className="space-y-3 md:space-y-4 max-w-xs mx-auto pb-safe">
              {isLoadingUiElements ? (
                <div>Loading UI...</div>
              ) : (
                visibleElements.map((element) => {
                  console.log(`[Customer Page] Mapping Element - ID: ${element.id}, Name: ${element.name}, Type: ${element.type}, Visible: ${element.is_visible}`);
                  
                  if (element.type === 'button') {
                    return (
                      <Button 
                        key={element.id}
                        className={`w-full h-auto min-h-[56px] text-lg font-medium flex items-center justify-center px-4 py-3 ${
                          element.name === 'view_menu' || element.name === 'book_now'
                            ? 'bg-[#C4A36F] hover:bg-[#B39260]'
                            : 'bg-[#4A4A4A] hover:bg-[#3A3A3A]'
                        } text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target`}
                        onClick={() => {
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
                        }}
                      >
                        {renderIcon(element.icon)} 
                        <div className="flex flex-col text-center">
                           <span className="text-lg font-medium">
                             {language === 'ar' ? element.display_name_ar : element.display_name}
                           </span>
                           {element.description && (
                             <span className="text-xs font-normal text-gray-200 mt-1">
                               {language === 'ar' ? element.description_ar : element.description}
                             </span>
                           )}
                        </div>
                      </Button>
                    );
                  } else if (element.type === 'section' && element.name === 'eid_bookings') {
                    console.log("[Customer Page] Rendering Fresha/Eid Bookings Section for element:", element);
                    return (
                      <div 
                        key={element.id} 
                        className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => {
                          trackButtonClick({
                            buttonId: 'eid_bookings', 
                            buttonName: language === 'ar' ? element.display_name_ar : element.display_name
                          });
                          setEidBookingsDialogOpen(true);
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEidBookingsDialogOpen(true); }}
                      >
                        <div className="flex items-center justify-between">
                          <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                            <h2 className={`text-lg font-bold text-[#222222] mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {language === 'ar' ? element.display_name_ar : element.display_name}
                            </h2>
                            {element.description && (
                              <p className={`text-gray-600 text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {language === 'ar' ? element.description_ar : element.description}
                              </p>
                            )}
                          </div>
                          <div className="h-10 w-px bg-gray-200 mx-3"></div>
                          <div className="flex-shrink-0">
                            <img src={freshaLogo} alt="Fresha Logo" className="h-8 w-auto" />
                          </div>
                        </div>
                      </div>
                    );
                  } else if (element.type === 'section' && element.name === 'loyalty_program') {
                    console.log("[Customer Page] Rendering Loyalty Program Section for element:", element);
                    return (
                      <div 
                        key={element.id} 
                        className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                        onClick={() => {
                          trackButtonClick({
                            buttonId: 'loyalty_program',
                            buttonName: language === 'ar' ? element.display_name_ar : element.display_name
                          });
                          window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank');
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank'); }}
                      >
                        <div className="flex items-center justify-between">
                           <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                            <h2 className={`text-lg font-bold text-[#222222] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {language === 'ar' ? element.display_name_ar : element.display_name}
                            </h2>
                            {element.description && (
                              <p className={`text-gray-600 text-xs mt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                {language === 'ar' ? element.description_ar : element.description}
                              </p>
                            )}
                          </div>
                          <div className="h-10 w-px bg-gray-200 mx-3"></div>
                          <div className="flex-shrink-0 flex flex-col items-center justify-center">
                            <img src={boonusLogo} alt="Boonus Logo" className="h-8 w-auto" />
                          </div>
                        </div>
                      </div>
                    );
                  } else if (element.type === 'section' && element.name === 'google_reviews') {
                    console.log("[Customer Page] Rendering Google Reviews Section for element:", element);
                    return <GoogleReviews key={element.id} />;
                  }
                  return null;
                })
              )}

              <InstallAppPrompt />
            </div>
          </div>
        </PullToRefresh>
      </div>

      <LanguageSwitcher />

      <BranchDialog 
        open={branchDialogOpen} 
        onOpenChange={setBranchDialogOpen} 
        branches={branches} 
        onBranchSelect={handleBranchSelect} 
      />
      <LocationDialog 
        open={locationDialogOpen} 
        onOpenChange={setLocationDialogOpen} 
        branches={branches} 
        onLocationClick={handleLocationClick} 
      />
      <EidBookingsDialog 
        open={eidBookingsDialogOpen} 
        onOpenChange={setEidBookingsDialogOpen} 
        branches={branches} 
        onBranchSelect={handleEidBranchSelect} 
      />
      <footer className="page-footer" />
    </div>
  );
};

export default Customer;
