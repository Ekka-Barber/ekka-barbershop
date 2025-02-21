
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { Apple } from 'lucide-react';
import AndroidIcon from '@/components/icons/AndroidIcon';
import AddToHomeScreenIcon from '@/components/icons/AddToHomeScreenIcon';
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
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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

  const getInstallDescription = () => {
    switch (platform) {
      case 'ios':
        return t('install.guide.description.ios');
      case 'android':
        return t('install.guide.description.android');
      default:
        return t('install.guide.description.desktop');
    }
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

  const PlatformIcon = platform === 'ios' ? Apple : AndroidIcon;

  // If already installed or installation not supported, don't show the prompt
  if (!install) {
    return null;
  }

  return (
    <>
      <AlertDialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full flex items-center justify-center gap-3 py-6 text-lg font-medium bg-[#9B87F5] hover:bg-[#8A74F2] text-white transition-all duration-300 group"
            onClick={handleInstallClick}
          >
            <PlatformIcon className="h-8 w-8 animate-[heart-beat_2s_cubic-bezier(0.4,0,0.6,1)_infinite] group-hover:text-white" />
            <span className="text-xl font-semibold animate-[heart-beat_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
              {language === 'ar' ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App'}
            </span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className={`${language === 'ar' ? 'rtl' : 'ltr'} max-w-md`}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              {platform === 'ios' ? t('install.guide.title') : t('install.guide.title')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {language === 'ar' 
                  ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك'
                  : 'Faster bookings, exclusive offers, and extra benefits await you'}
              </p>
              <div className="mt-4 text-base whitespace-pre-line">
                {getInstallDescription()}
              </div>
              {platform === 'ios' && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <AddToHomeScreenIcon />
                  <span>
                    {language === 'ar' 
                      ? 'اختر "إضافة إلى الشاشة الرئيسية"'
                      : 'Choose "Add to Home Screen"'}
                  </span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={language === 'ar' ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            {platform === 'android' && (
              <AlertDialogAction
                onClick={handleInstallation}
                disabled={isInstalling}
                className="gap-2"
              >
                {isInstalling && <Loader2 className="h-4 w-4 animate-spin" />}
                {isInstalling ? t('installing') : t('install')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
