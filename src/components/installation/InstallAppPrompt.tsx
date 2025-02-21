
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
import { NewBadge } from "@/components/ui/new-badge"

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
          <div className="relative w-full animate-fade-in">
            <Button
              variant="default"
              className="w-full h-14 text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl touch-target group overflow-hidden"
              onClick={handleInstallClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#C4A484]/20 via-transparent to-[#C4A484]/20 group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <span className="relative z-10">{t('install.app')}</span>
            </Button>
            <NewBadge />
          </div>
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
