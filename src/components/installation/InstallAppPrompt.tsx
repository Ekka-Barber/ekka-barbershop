
import { useState, useEffect } from 'react';
import { usePWAInstall } from 'react-use-pwa-install';
import { useLanguage } from "@/contexts/LanguageContext";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { getPlatformType, getInstallationStatus } from "@/services/platformDetection";
import { useToast } from "@/components/ui/use-toast";
import { InstallButton } from './InstallButton';
import { IOSInstallGuide } from './IOSInstallGuide';
import { useLocation } from 'react-router-dom';

export const InstallAppPrompt = () => {
  const { t, language } = useLanguage();
  const [isInstalling, setIsInstalling] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const install = usePWAInstall();
  const { toast } = useToast();
  const platform = getPlatformType();
  const installationStatus = getInstallationStatus();
  const location = useLocation();
  
  // Check if we're on the admin route
  const isAdminRoute = location.pathname.includes('/admin');
  
  // Different localStorage key for admin vs user app
  const dismissalKey = isAdminRoute ? 'admin_app_install_dismissed' : 'app_install_dismissed';

  // Check local storage for user's dismissal preference
  useEffect(() => {
    const dismissed = localStorage.getItem(dismissalKey);
    if (dismissed === 'true') {
      setIsPromptDismissed(true);
    }
  }, [dismissalKey]);

  const handleDismiss = () => {
    setIsPromptDismissed(true);
    localStorage.setItem(dismissalKey, 'true');
  };

  const handleInstallClick = async () => {
    trackButtonClick({
      buttonId: isAdminRoute ? 'install_admin_app' : 'install_app',
      buttonName: isAdminRoute ? 'Install Admin App' : 'Install App'
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
      isAdmin={isAdminRoute}
    />
  );

  if (platform === 'ios') {
    return (
      <IOSInstallGuide
        language={language}
        onCancel={handleDismiss}
        trigger={installButton}
        isAdmin={isAdminRoute}
      />
    );
  }

  return installButton;
};
