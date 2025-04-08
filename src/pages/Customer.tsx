import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as Icons from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import { BranchDialog } from "@/components/customer/BranchDialog";
import { LocationDialog } from "@/components/customer/LocationDialog";
import { EidBookingsDialog } from "@/components/customer/EidBookingsDialog";
import { trackViewContent, trackButtonClick, trackLocationView } from "@/utils/tiktokTracking";
import { InstallAppPrompt } from "@/components/installation/InstallAppPrompt";
import { PullToRefresh } from "@/components/common/PullToRefresh";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";
import freshaLogo from "@/assets/fresha-logo.svg";
import boonusLogo from "@/assets/boonus-logo.svg";
import GoogleReviews from "@/components/customer/GoogleReviews";
import { motion, stagger, useAnimate } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AppLayout from '@/components/layout/AppLayout';
import { Tables } from "@/types/supabase";
import { Separator } from "@/components/ui/separator";

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  is_main: boolean;
  whatsapp_number: string;
  google_maps_url: string;
  working_hours: string;
  google_place_id: string;
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
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [selectedBranch] = useState<Branch | null>(null);
  const [scope, animate] = useAnimate();

  useEffect(() => {
    trackViewContent({
      pageId: 'home',
      pageName: 'Home'
    });
  }, []);

  // Animation sequence for the buttons
  useEffect(() => {
    const animateButtons = async () => {
      if (scope.current) {
        await animate(
          ".logo-animation",
          { opacity: [0, 1], y: [-20, 0] },
          { duration: 0.6, ease: "easeOut" }
        );
        
        await animate(
          ".headline-animation",
          { opacity: [0, 1], y: [-10, 0] },
          { duration: 0.5, delay: 0.2 }
        );
        
        await animate(
          ".divider-animation",
          { scaleX: [0, 1], opacity: [0, 1] },
          { duration: 0.4, delay: 0.1 }
        );
        
        await animate(
          ".button-animation",
          { opacity: [0, 1], y: [10, 0] },
          { duration: 0.4, delay: stagger(0.1) }
        );
        
        await animate(
          ".section-animation",
          { opacity: [0, 1], y: [15, 0] },
          { duration: 0.5, delay: stagger(0.15) }
        );
      }
    };
    
    animateButtons();
  }, [animate, scope]);

  const { data: branches, refetch } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, name_ar, address, address_ar, is_main, whatsapp_number, google_maps_url, working_hours, google_place_id');
      if (error) throw error;
      
      logger.info(`Fetched ${data?.length || 0} branches`);
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

  return (
    <AppLayout>
      <PullToRefresh
        onRefresh={handleRefresh}
        pullDownThreshold={100}
        autoDisableOnPlatforms={true}
      >
        <div 
          className="flex flex-1 flex-col justify-start items-center w-full max-w-md mx-auto pb-40"
          ref={scope}
        >
          <div className="text-center flex-shrink-0 mx-auto pt-safe w-full">
            <motion.img 
              src="lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png" 
              alt="Ekka Barbershop Logo" 
              className="h-28 md:h-32 mx-auto mb-4 md:mb-6 object-contain logo-animation"
              loading="eager"
              width="320" 
              height="128"
            />
            <div className="space-y-1 md:space-y-2">
              <motion.h2 
                className="text-xl font-medium text-[#222222] headline-animation"
              >
                {t('welcome.line1')}
              </motion.h2>
              <motion.h1
                className="text-2xl md:text-3xl font-bold text-[#222222] headline-animation"
              >
                {t('welcome.line2')}
              </motion.h1>
            </div>
            <motion.div 
              className="h-1 w-24 bg-[#C4A36F] mx-auto mt-3 md:mt-4 mb-6 divider-animation"
              style={{ originX: 0.5 }}
            ></motion.div>
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
                      <motion.div
                        key={el.id}
                        className="button-animation"
                        whileHover={{ 
                          scale: 1.03, 
                          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
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
                          <motion.div 
                            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                          >
                            {renderIcon(el.icon)}
                          </motion.div>
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
                      </motion.div>
                    );
                  } else if (el.type === 'section' && el.name === 'eid_bookings') {
                     return (
                       <motion.div
                         key={el.id}
                         className="section-animation"
                         whileHover={{ 
                           scale: 1.02, 
                           boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
                         }}
                         whileTap={{ scale: 0.98 }}
                         transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                         <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
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
                             <motion.div 
                               className="flex-shrink-0"
                               whileHover={{ y: -2, rotate: 2 }}
                               transition={{ type: "spring", stiffness: 300, damping: 10 }}
                             >
                               <img src={freshaLogo} alt="Fresha Logo" className="h-8 w-auto" />
                             </motion.div>
                           </div>
                         </div>
                       </motion.div>
                     );
                  } else if (el.type === 'section' && el.name === 'loyalty_program') {
                     return (
                       <>
                         <motion.div
                           key={el.id}
                           className="section-animation"
                           whileHover={{ 
                             scale: 1.02, 
                             boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
                           }}
                           whileTap={{ scale: 0.98 }}
                           transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                           <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
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
                               <motion.div 
                                 className="flex-shrink-0 flex flex-col items-center justify-center"
                                 whileHover={{ y: -2, rotate: -2 }}
                                 transition={{ type: "spring", stiffness: 300, damping: 10 }}
                               >
                                 <img src={boonusLogo} alt="Boonus Logo" className="h-8 w-auto" />
                               </motion.div>
                             </div>
                           </div>
                         </motion.div>
                         <motion.div 
                           className="w-full max-w-xs mx-auto my-4 section-animation"
                           initial={{ scaleX: 0, opacity: 0 }}
                           animate={{ scaleX: 1, opacity: 1 }}
                           transition={{ 
                             duration: 0.5,
                             delay: 0.2,
                             ease: "easeOut"
                           }}
                         >
                            <Separator
                              orientation="horizontal"
                              className="bg-[#C4A36F]/30 h-[1px] w-full"
                            />
                          </motion.div>
                       </>
                     );
                   } else if (el.type === 'section' && el.name === 'google_reviews') {
                     return <GoogleReviews key={el.id} />;
                   }
                  return null;
                })
              )}
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
