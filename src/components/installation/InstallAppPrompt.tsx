
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Share } from "lucide-react";
import { getPlatformType, getInstallationStatus } from "@/services/platformDetection";
import { useLanguage } from "@/contexts/LanguageContext";
import { AndroidIcon } from "@/components/icons/AndroidIcon";
import { AppleIcon } from "@/components/icons/AppleIcon";
import { AddToHomeScreenIcon } from "@/components/icons/AddToHomeScreenIcon";
import { NewBadge } from "@/components/ui/new-badge";
import { trackButtonClick } from "@/utils/tiktokTracking";

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
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show prompt for both iOS and Android when not installed
    if ((platform === 'ios' || platform === 'android') && installStatus === 'not-installed') {
      setShowPrompt(true);
      console.log(`${platform} installation prompt should be shown`);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [platform, installStatus]);

  const handleInstallClick = async () => {
    trackButtonClick('Install App');
    if (platform === 'android') {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } else {
        // If no install prompt is available, show instructions
        setIsSheetOpen(true);
      }
    }
  };

  if (!showPrompt || installStatus === 'installed') return null;

  const isRTL = language === 'ar';

  const renderInstallButton = () => (
    <div className="relative">
      <NewBadge />
      <Button 
        className="w-full h-14 text-lg font-medium bg-[#9b87f5] hover:bg-[#8B5CF6] text-white 
                   transition-all duration-300 shadow-lg hover:shadow-xl touch-target
                   hover:scale-[1.02] relative
                   before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#9b87f5]/20 before:to-[#8B5CF6]/20 
                   before:animate-[shimmer_2s_infinite] before:rounded-md
                   ring-2 ring-[#9b87f5]/20 hover:ring-[#8B5CF6]/30"
        onClick={() => {
          if (platform === 'ios') {
            setIsSheetOpen(true);
          } else {
            handleInstallClick();
          }
        }}
      >
        <div className={`w-full flex items-center ${isRTL ? 'flex-row-reverse' : 'flex-row'} justify-center gap-2 animate-heart-beat`}>
          {platform === 'ios' ? <AppleIcon /> : <AndroidIcon />}
          <span className="drop-shadow-sm">{language === 'ar' ? "حمل تطبيق إكّه الآن" : 'Install App'}</span>
        </div>
      </Button>
    </div>
  );

  const renderDescription = () => (
    <p className="text-sm text-muted-foreground text-center mt-2 px-2 animate-fade-in">
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
                  <p>
                    {language === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'} 
                    <AddToHomeScreenIcon />
                  </p>
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
