import { useState, useEffect } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType, getInstallationStatus } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { InstallButton } from './InstallButton';
import { IOSInstallGuide } from './IOSInstallGuide';

export const InstallAppPrompt = () => {
  const { t, language } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const install = usePWAInstall();
  const { toast } = useToast();
  const platform = getPlatformType();
  const installationStatus = getInstallationStatus();

  // Check local storage for user's dismissal preference
  useEffect(() => {
    const dismissed = localStorage.getItem('app_install_dismissed');
    if (dismissed === 'true') {
      setIsPromptDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsPromptDismissed(true);
    localStorage.setItem('app_install_dismissed', 'true');
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
      setShowInstructions(true);
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
      showInstructions={showInstructions}
      handleInstallClick={handleInstallClick}
    />
  );

  if (platform === 'ios') {
    return (
      <IOSInstallGuide
        language={language}
        onCancel={handleDismiss}
        trigger={installButton}
      />
    );
  }

  return installButton;
};

// Add CSS class to style parent container for proper positioning
export const getInstallPromptStyles = () => {
  return {
    container: "relative w-full",
    spacer: "h-36" // Add this spacer to ensure content above is visible
  };
};
