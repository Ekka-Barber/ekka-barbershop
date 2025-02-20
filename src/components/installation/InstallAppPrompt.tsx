
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Download, Share2 } from "lucide-react";
import { getPlatformType, getInstallationStatus, canInstallPWA } from "@/services/platformDetection";
import { useLanguage } from "@/contexts/LanguageContext";

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [platform] = useState(getPlatformType());
  const [installStatus] = useState(getInstallationStatus());
  const { language } = useLanguage();

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if should show prompt for iOS
    if (platform === 'ios' && installStatus === 'not-installed') {
      setShowPrompt(true);
      console.log('iOS installation prompt should be shown');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [platform, installStatus]);

  const handleInstallClick = async () => {
    if (platform === 'android' && deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  if (!showPrompt || installStatus === 'installed') return null;

  const isRTL = language === 'ar';

  return (
    <div className="mt-4">
      {platform === 'ios' ? (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button 
              className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 touch-target"
              onClick={() => {
                console.log('iOS install button clicked');
                setIsSheetOpen(true);
              }}
            >
              <div className={`w-full flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
                <Download className="h-5 w-5" />
                <span>{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-[400px] rounded-t-xl"
            onInteractOutside={(e) => {
              e.preventDefault();
              setIsSheetOpen(false);
            }}
          >
            <SheetHeader>
              <SheetTitle>{language === 'ar' ? 'تثبيت التطبيق على الشاشة الرئيسية' : 'Add to Home Screen'}</SheetTitle>
              <SheetDescription>
                {language === 'ar' ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-6 mt-6">
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">1</div>
                <p>{language === 'ar' ? 'انقر على زر المشاركة' : 'Tap the share button'} <Share2 className="inline h-5 w-5" /></p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">2</div>
                <p>{language === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">3</div>
                <p>{language === 'ar' ? 'انقر على "إضافة"' : 'Tap "Add"'}</p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Button 
          className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 touch-target"
          onClick={handleInstallClick}
        >
          <div className={`w-full flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
            <Download className="h-5 w-5" />
            <span>{language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
          </div>
        </Button>
      )}
    </div>
  );
}
