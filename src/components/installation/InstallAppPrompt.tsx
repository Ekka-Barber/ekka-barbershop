
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
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

export const InstallAppPrompt = () => {
  const { t } = useLanguage();
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const install = usePWAInstall();

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

  // If already installed, don't show the prompt
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('install.guide.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('install.guide.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (install) {
                await install();
                setShowInstallGuide(false);
              }
            }}>{t('install')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
