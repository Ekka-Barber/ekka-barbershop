
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Share } from "lucide-react";
import { getPlatformType, getInstallationStatus } from "@/services/platformDetection";
import { useLanguage } from "@/contexts/LanguageContext";
import { AndroidIcon } from "@/components/icons/AndroidIcon";
import { AppleIcon } from "@/components/icons/AppleIcon";

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

  const renderInstallButton = () => (
    <Button 
      className="w-full h-14 text-lg font-medium bg-[#9b87f5] hover:bg-[#8B5CF6] text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target"
      onClick={() => {
        if (platform === 'ios') {
          console.log('iOS install button clicked');
          setIsSheetOpen(true);
        } else {
          handleInstallClick();
        }
      }}
    >
      <div className={`w-full flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2`}>
        {platform === 'ios' ? <AppleIcon /> : <AndroidIcon />}
        <span>{language === 'ar' ? "حمل تطبيق إكّه الآن" : 'Install App'}</span>
      </div>
    </Button>
  );

  const renderDescription = () => (
    <p className="text-sm text-muted-foreground text-center mt-2 px-2">
      {language === 'ar' 
        ? "حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك"
        : "Faster bookings, exclusive offers, and more features await you"}
    </p>
  );

  return (
    <div className="mt-4">
      {platform === 'ios' ? (
        <>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              {renderInstallButton()}
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
                <SheetTitle>{language === 'ar' ? 'لتثبيت التطبيق على الشاشة الرئيسية' : 'Add to Home Screen'}</SheetTitle>
                <SheetDescription>
                  {language === 'ar' ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">1</div>
                  <p>{language === 'ar' ? 'انقر على زر المشاركة' : 'Tap the share button'} <Share className="inline h-5 w-5" /></p>
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
          {renderDescription()}
        </>
      ) : (
        <>
          {renderInstallButton()}
          {renderDescription()}
        </>
      )}
    </div>
  );
}

