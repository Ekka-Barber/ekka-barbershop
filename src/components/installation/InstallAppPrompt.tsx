
import { useEffect, useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { InstallButton } from './InstallButton';
import { IOSInstallGuide } from './IOSInstallGuide';
import { AndroidInstallGuide } from './AndroidInstallGuide';

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

  const installButton = (
    <InstallButton
      platform={platform as 'ios' | 'android'}
      language={language}
      onClick={handleInstallClick}
    />
  );

  if (platform === 'ios') {
    return (
      <IOSInstallGuide
        language={language}
        onCancel={() => setShowInstallGuide(false)}
        trigger={installButton}
      />
    );
  }

  return (
    <AndroidInstallGuide
      language={language}
      isOpen={showInstallGuide}
      isInstalling={isInstalling}
      onOpenChange={setShowInstallGuide}
      onInstall={handleInstallation}
      trigger={installButton}
    />
  );
};
