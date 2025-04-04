import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { isRunningAsStandalone, getViewportDimensions } from "@/services/platformDetection";
import { logger } from "@/utils/logger";
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
import AppLayout from '@/components/layout/AppLayout';
import { Tables } from "@/types/supabase";

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
  const contentRef = useRef<HTMLDivElement>(null);
  const isStandalone = isRunningAsStandalone();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const { height } = getViewportDimensions();
      setViewportHeight(height);
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
  }, [isStandalone]);

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
        logger.error("Error fetching UI elements:", error);
        throw error;
      }
      return data as Tables<'ui_elements'>[];
    }
  });

  const visibleElements = useMemo(() => {
    if (!uiElements) return [];
    return uiElements.filter(el => el.is_visible);
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

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

  return (
    <AppLayout>
      <PullToRefresh 
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms={true}
      >
        <div className="flex flex-1 flex-col justify-start items-center max-w-md mx-auto">
          <div className="text-center flex-shrink-0 mx-auto pt-safe w-full">
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
            <div className="w-full max-w-xs mx-auto space-y-4">
              {isLoadingUiElements ? (
                <>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                </>
              ) : (
                visibleElements.map((el) => {
                  if (el.type === 'button') {
                    return (
                      <Button
                        key={el.id}
                        className={`w-full h-auto min-h-[56px] text-lg font-medium flex items-center justify-center px-4 py-3 ${
                          el.name === 'view_menu' || el.name === 'book_now'
                            ? 'bg-[#C4A36F] hover:bg-[#B39260]'
                            : 'bg-[#4A4A4A] hover:bg-[#3A3A3A]'
                        } text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target`}
                        onClick={() => {
                          trackButtonClick({
                            buttonId: el.name,
                            buttonName: language === 'ar' ? el.display_name_ar : el.display_name
                          });

                          if (el.action?.startsWith('http')) {
                            window.open(el.action, '_blank');
                          } else if (el.action === 'openBranchDialog') {
                            setBranchDialogOpen(true);
                          } else if (el.action === 'openLocationDialog') {
                            handleLocationDialog();
                          } else if (el.action === 'openEidBookingsDialog') {
                            setEidBookingsDialogOpen(true);
                          } else if (el.action) {
                            navigate(el.action);
                          }
                        }}
                      >
                        {renderIcon(el.icon)}
                        <div className="flex flex-col text-center">
                           <span className="text-lg font-medium">
                             {language === 'ar' ? el.display_name_ar : el.display_name}
                           </span>
                           {el.description && (
                             <span className="text-xs font-normal text-gray-200 mt-1">
                               {language === 'ar' ? el.description_ar : el.description}
                             </span>
                           )}
                        </div>
                      </Button>
                    );
                  } else if (el.type === 'section' && el.name === 'eid_bookings') {
                     return (
                       <div
                         key={el.id}
                         className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                         onClick={() => {
                           trackButtonClick({
                             buttonId: 'eid_bookings',
                             buttonName: language === 'ar' ? el.display_name_ar : el.display_name
                           });
                           setEidBookingsDialogOpen(true);
                         }}
                         role="button"
                         tabIndex={0}
                         aria-label={language === 'ar' ? el.display_name_ar : el.display_name}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setEidBookingsDialogOpen(true); }}
                       >
                         <div className="flex items-center justify-between">
                           <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                             <h2 className={`text-lg font-bold text-[#222222] mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                               {language === 'ar' ? el.display_name_ar : el.display_name}
                             </h2>
                             {el.description && (
                               <p className={`text-gray-600 text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                 {language === 'ar' ? el.description_ar : el.description}
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
                  } else if (el.type === 'section' && el.name === 'loyalty_program') {
                     return (
                       <div
                         key={el.id}
                         className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
                         onClick={() => {
                           trackButtonClick({
                             buttonId: 'loyalty_program',
                             buttonName: language === 'ar' ? el.display_name_ar : el.display_name
                           });
                           window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank');
                         }}
                         role="button"
                         tabIndex={0}
                         aria-label={language === 'ar' ? el.display_name_ar : el.display_name}
                         onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank'); }}
                       >
                         <div className="flex items-center justify-between">
                            <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
                             <h2 className={`text-lg font-bold text-[#222222] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                               {language === 'ar' ? el.display_name_ar : el.display_name}
                             </h2>
                             {el.description && (
                               <p className={`text-gray-600 text-xs mt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                                 {language === 'ar' ? el.description_ar : el.description}
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
                   } else if (el.type === 'section' && el.name === 'google_reviews') {
                     return <GoogleReviews key={el.id} />;
                   }
                  return null;
                })
              )}
            </div>

            <div className="h-px w-full max-w-xs mx-auto bg-gray-200"></div>

            <div className="flex justify-center items-center space-x-6 mt-8">
              {visibleElements.map((el) => {
                if (el.type === 'section' && (el.name === 'loyalty_program' || el.name === 'eid_bookings')) {
                  let imgSrc = '';
                  let altText = '';
                  let isDialogTrigger = false;

                  if (el.name === 'eid_bookings') {
                    imgSrc = freshaLogo;
                    altText = 'Fresha';
                    isDialogTrigger = true;
                  } else if (el.name === 'loyalty_program') {
                    return null;
                  }

                  if (imgSrc) {
                    if (isDialogTrigger) {
                      return null;
                    }

                    const linkUrl = el.action ?? '#';
                    const trackingId = `social_${el.icon || el.name}`;
                    const trackingName = `Social ${altText}`;

                    return (
                      <a
                        key={el.id}
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C4A36F] rounded-md"
                        aria-label={`Visit our ${altText} page`}
                        onClick={() => {
                          trackButtonClick({
                            buttonId: trackingId,
                            buttonName: trackingName,
                          });
                        }}
                      >
                        <img src={imgSrc} alt={altText} className="h-10 w-auto" />
                      </a>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>
        </div>
      </PullToRefresh>

      <LanguageSwitcher />

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
