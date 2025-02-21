
import { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import NotificationPermissionDialog from './NotificationPermissionDialog';
import InstallationGuide from './InstallationGuide';
import { getInstallationStatus, isServiceWorkerSupported } from '@/services/platformDetection';
import { NotificationToggleButton } from './notifications/NotificationToggleButton';
import { useNotificationSubscription } from './notifications/NotificationSubscriptionManager';
import { useNotificationSubscriber } from './notifications/NotificationSubscriber';

const PushNotificationToggle = () => {
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [installationGuideOpen, setInstallationGuideOpen] = useState(false);
  const { language } = useLanguage();
  const [installationStatus, setInstallationStatus] = useState(getInstallationStatus());

  const {
    isSubscribed,
    vapidKey,
    platform,
    permissionState,
    setIsSubscribed
  } = useNotificationSubscription();

  const { subscribeUser, unsubscribeUser } = useNotificationSubscriber({
    vapidKey: vapidKey || '',
    platform,
    permissionState,
    setIsSubscribed,
    language
  });

  useEffect(() => {
    // Update installation status on mount and when visibility changes
    const handleVisibilityChange = () => {
      setInstallationStatus(getInstallationStatus());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleEnableNotifications = () => {
    if (installationStatus !== 'installed') {
      setInstallationGuideOpen(true);
      return;
    }

    if (!isServiceWorkerSupported()) {
      toast.error(
        language === 'ar' 
          ? 'عذراً، متصفحك لا يدعم الإشعارات'
          : 'Sorry, your browser does not support notifications'
      );
      return;
    }

    setPermissionDialogOpen(true);
  };

  // Hide the button if notifications are not supported
  if (!isServiceWorkerSupported() && installationStatus !== 'not-installed') {
    return null;
  }

  return (
    <>
      <NotificationToggleButton
        isSubscribed={isSubscribed}
        onClick={() => isSubscribed ? unsubscribeUser() : handleEnableNotifications()}
        language={language}
      />

      <NotificationPermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        onAccept={subscribeUser}
      />

      <InstallationGuide
        open={installationGuideOpen}
        onOpenChange={setInstallationGuideOpen}
        onComplete={() => {
          setInstallationGuideOpen(false);
          setPermissionDialogOpen(true);
        }}
      />
    </>
  );
};

export default PushNotificationToggle;
