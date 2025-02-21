
import { useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { InstallButton } from './InstallButton';
import { IOSInstallGuide } from './IOSInstallGuide';

export const InstallAppPrompt = () => {
  const { t, language } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const install = usePWAInstall();
  const { toast } = useToast();
  const platform = getPlatformType();

  const handleInstallClick = async () => {
    trackButtonClick({
      buttonId: 'install_app',
      buttonName: 'Install App'
    });

    if (platform === 'android' && install) {
      setIsInstalling(true);
      try {
        await install();
        toast({
          title: t('install.success'),
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: t('install.error'),
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsInstalling(false);
      }
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
        onCancel={() => {}}
        trigger={installButton}
      />
    );
  }

  return installButton;
};
