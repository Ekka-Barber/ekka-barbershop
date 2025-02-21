
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Check, ArrowBigDown } from 'lucide-react';
import AndroidIcon from '@/components/icons/AndroidIcon';
import AppleIcon from '@/components/icons/AppleIcon';
import AddToHomeScreenIcon from '@/components/icons/AddToHomeScreenIcon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const InstallAppPrompt = () => {
  const { t, language } = useLanguage();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const install = usePWAInstall();
  const { toast } = useToast();
  const platform = getPlatformType();

  useEffect(() => {
    const checkInstallState = async () => {
      if (install && await install()) {
        setShowInstallGuide(false);
      }
    };
    checkInstallState();
  }, [install]);

  const handleInstallClick = () => {
    trackButtonClick({
      buttonId: 'install_app',
      buttonName: 'Install App'
    });
    setShowInstallGuide(true);
  };

  const handleInstallation = async () => {
    if (!install) return;
    
    setIsInstalling(true);
    try {
      await install();
      toast({
        title: t('install.success'),
        duration: 3000,
      });
      setShowInstallGuide(false);
    } catch (error) {
      toast({
        title: t('install.error'),
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsInstalling(false);
    }
  };

  const shouldShowPrompt = platform === 'ios' || (platform === 'android' && install);

  if (!shouldShowPrompt) {
    return null;
  }

  const renderIOSContent = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="w-full flex items-center justify-center gap-3 py-6 text-lg font-medium bg-[#9B87F5] hover:bg-[#8A74F2] text-white transition-all duration-300 group"
          onClick={handleInstallClick}
        >
          <div className={`flex items-center justify-center gap-6 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <AppleIcon />
            <div className="flex flex-col items-center gap-2">
              <ArrowBigDown className="w-6 h-6 animate-bounce" />
              <span className="font-changa text-xl font-semibold animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                {language === 'ar' ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App'}
              </span>
            </div>
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className={`${language === 'ar' ? 'rtl' : 'ltr'} font-changa rounded-t-xl p-0`}
      >
        <div className="p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-center">
              {language === 'ar' ? 'تثبيت التطبيق على الشاشة الرئيسية' : 'Add to Home Screen'}
            </SheetTitle>
            <SheetDescription className="text-center text-base font-medium">
              {language === 'ar' ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Share2 className="w-6 h-6 text-gray-600" />
                <span className="text-base">
                  {language === 'ar' ? 'انقر على زر المشاركة' : 'Tap the Share button'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex items-center gap-3 flex-1">
                <AddToHomeScreenIcon />
                <span className="text-base">
                  {language === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Check className="w-6 h-6 text-gray-600" />
                <span className="text-base">
                  {language === 'ar' ? 'انقر على "إضافة" للتأكيد' : 'Tap "Add" to confirm'}
                </span>
              </div>
            </div>
          </div>

          <SheetClose asChild>
            <Button 
              variant="outline" 
              className="w-full mt-4"
            >
              {t('cancel')}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );

  const renderAndroidContent = () => (
    <AlertDialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
      <AlertDialogTrigger asChild>
        <Button
          className="w-full flex items-center justify-center gap-3 py-6 text-lg font-medium bg-[#9B87F5] hover:bg-[#8A74F2] text-white transition-all duration-300 group"
          onClick={handleInstallClick}
        >
          <div className={`flex items-center justify-center gap-6 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
            <AndroidIcon />
            <div className="flex flex-col items-center gap-2">
              <ArrowBigDown className="w-6 h-6 animate-bounce" />
              <span className="font-changa text-xl font-semibold animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
                {language === 'ar' ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App'}
              </span>
            </div>
          </div>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={`${language === 'ar' ? 'rtl' : 'ltr'} max-w-md font-changa`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            {t('install.guide.title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك'
                : 'Faster bookings, exclusive offers, and extra benefits await you'}
            </p>
            <div className="mt-4 text-base whitespace-pre-line">
              {t('install.guide.description.android')}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={language === 'ar' ? 'flex-row-reverse' : ''}>
          <AlertDialogCancel className="font-changa">{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleInstallation}
            disabled={isInstalling}
            className="gap-2 font-changa"
          >
            {isInstalling && <Loader2 className="h-4 w-4 animate-spin" />}
            {isInstalling ? t('installing') : t('install')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return platform === 'ios' ? renderIOSContent() : renderAndroidContent();
};
