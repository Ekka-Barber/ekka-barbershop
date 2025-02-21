
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
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

  // If already installed or installation not supported, don't show the prompt
  if (!install) {
    return null;
  }

  return (
    <>
      <AlertDialog open={showInstallGuide} onOpenChange={setShowInstallGuide}>
        <AlertDialogTrigger asChild>
          <Button
            className="w-full h-14 text-lg font-medium bg-white hover:bg-gray-50 text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-200 touch-target"
            onClick={handleInstallClick}
          >
            {t('install.app')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className={language === 'ar' ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('install.guide.title')}</AlertDialogTitle>
            <AlertDialogDescription className="whitespace-pre-line">
              {getInstallDescription()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={language === 'ar' ? 'flex-row-reverse' : ''}>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleInstallation}
              disabled={isInstalling}
              className="gap-2"
            >
              {isInstalling && <Loader2 className="h-4 w-4 animate-spin" />}
              {isInstalling ? t('installing') : t('install')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
