import { useState } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';

import { getPlatformType, getInstallationStatus } from "@shared/services/platformDetection";
import { useToast } from "@shared/ui/components/use-toast";
import { getStorageItem, setStorageItem } from "@shared/utils/cachedStorage";
import { trackButtonClick } from "@shared/utils/tiktokTracking";

import { InstallButton } from './InstallButton';
import { IOSInstallGuide } from './IOSInstallGuide';

import { useLanguage } from "@/contexts/LanguageContext";

const INSTALL_DISMISSED_KEY = 'app_install_dismissed';

export const InstallAppPrompt = () => {
  const { t, language } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(() => 
    getStorageItem(INSTALL_DISMISSED_KEY, 'false') === 'true'
  );
  const install = usePWAInstall();
  const { toast } = useToast();
  const platform = getPlatformType();
  const installationStatus = getInstallationStatus();

  const handleDismiss = () => {
    setIsPromptDismissed(true);
    setStorageItem(INSTALL_DISMISSED_KEY, 'true');
  };

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
      } catch {
        toast({
          title: t('install.error'),
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsInstalling(false);
      }
    } else if (platform === 'ios') {
      // iOS installation handled by IOSInstallGuide component
    }
  };

  // Don't show if already installed, on desktop, or if user dismissed
  if (installationStatus === 'installed' || platform === 'desktop' || platform === 'unsupported' || isPromptDismissed) {
    return null;
  }

  const shouldShowPrompt = platform === 'ios' || (platform === 'android' && install);

  if (!shouldShowPrompt) {
    return null;
  }

  const installButton = (
    <InstallButton
      platform={platform as 'ios' | 'android'}
      language={language}
      onClick={handleInstallClick}
      isInstalling={isInstalling}
      onDismiss={handleDismiss}
      handleInstallClick={handleInstallClick}
    />
  );

  const content = platform === 'ios'
    ? (
      <IOSInstallGuide
        language={language}
        onCancel={handleDismiss}
        trigger={installButton}
      />
    )
    : installButton;

  return (
    <div className="w-full mt-8">
      {content}
    </div>
  );
};
