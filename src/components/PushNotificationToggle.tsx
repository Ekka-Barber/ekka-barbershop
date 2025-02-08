
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationPermissionDialog from './NotificationPermissionDialog';
import InstallationGuide from './InstallationGuide';
import { BellRing, BellOff } from 'lucide-react';
import { 
  getPlatformType, 
  getInstallationStatus, 
  isServiceWorkerSupported 
} from '@/services/platformDetection';
import { notificationManager } from '@/services/notificationManager';
import type { NotificationStatus } from '@/services/notificationManager';
import type { Json } from '@/integrations/supabase/types';

const PushNotificationToggle = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [installationGuideOpen, setInstallationGuideOpen] = useState(false);
  const { language } = useLanguage();
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [platform] = useState(getPlatformType());
  const [installationStatus, setInstallationStatus] = useState(getInstallationStatus());
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Update installation status on mount and when visibility changes
    const handleVisibilityChange = () => {
      setInstallationStatus(getInstallationStatus());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (installationStatus === 'installed' && isServiceWorkerSupported()) {
      // Get VAPID key and check subscription status
      supabase.functions.invoke('get-vapid-key')
        .then(({ data }) => {
          if (data?.vapidKey) {
            setVapidKey(data.vapidKey);
            navigator.serviceWorker.ready.then(registration => {
              registration.pushManager.getSubscription().then(subscription => {
                setIsSubscribed(!!subscription);
                if (subscription) {
                  notificationManager.updateSubscriptionStatus(subscription, 'active');
                }
              });
            });
          }
        })
        .catch(console.error);

      // Check permission state
      if ('permissions' in navigator) {
        navigator.permissions.query({ name: 'notifications' })
          .then(permissionStatus => {
            setPermissionState(permissionStatus.state as NotificationPermission);
            permissionStatus.onchange = () => {
              setPermissionState(permissionStatus.state as NotificationPermission);
            };
          });
      }
    }
  }, [installationStatus, vapidKey]);

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

  const subscribeUser = async () => {
    try {
      if (!vapidKey) {
        throw new Error('VAPID key not available');
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      // Store subscription with enhanced tracking
      const platformDetails = await notificationManager.getPlatformDetails();
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
          status: 'active' as NotificationStatus,
          device_type: platform,
          permission_state: permissionState,
          platform_details: platformDetails as Json,
          last_active: new Date().toISOString(),
          error_count: 0,
          retry_count: 0
        });

      if (error) throw error;

      setIsSubscribed(true);
      toast.success(
        language === 'ar' 
          ? 'تم تفعيل الإشعارات بنجاح'
          : 'Notifications enabled successfully'
      );
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تفعيل الإشعارات'
          : 'Error enabling notifications'
      );
    }
  };

  const unsubscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Update subscription status with enhanced tracking
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ 
            status: 'inactive' as NotificationStatus,
            permission_state: 'denied',
            last_active: new Date().toISOString()
          })
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }
      
      setIsSubscribed(false);
      toast.success(
        language === 'ar' 
          ? 'تم إلغاء تفعيل الإشعارات'
          : 'Notifications disabled'
      );
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء إلغاء تفعيل الإشعارات'
          : 'Error disabling notifications'
      );
    }
  };

  // Hide the button if notifications are not supported
  if (!isServiceWorkerSupported() && installationStatus !== 'not-installed') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => isSubscribed ? unsubscribeUser() : handleEnableNotifications()}
        variant="outline"
        className="mt-4"
      >
        {isSubscribed ? (
          <>
            <BellOff className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'إلغاء تفعيل الإشعارات' : 'Disable Notifications'}
          </>
        ) : (
          <>
            <BellRing className="mr-2 h-4 w-4" />
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </>
        )}
      </Button>

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

