
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { getPlatformType, isServiceWorkerSupported } from '@/services/platformDetection';
import { notificationManager } from '@/services/notificationManager';
import type { NotificationStatus } from '@/services/notificationManager';
import type { Json } from '@/integrations/supabase/types';

export const useNotificationSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [platform] = useState(getPlatformType());
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (isServiceWorkerSupported()) {
      // Get VAPID key and check subscription status
      supabase.functions.invoke('get-vapid-key')
        .then(({ data }) => {
          if (data?.vapidKey) {
            setVapidKey(data.vapidKey);
            navigator.serviceWorker.ready.then(registration => {
              registration.pushManager.getSubscription().then(subscription => {
                setIsSubscribed(!!subscription);
                if (subscription) {
                  notificationManager.updateSubscriptionStatuses([{ endpoint: subscription.endpoint, success: true }]);
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
  }, []);

  return {
    isSubscribed,
    vapidKey,
    platform,
    permissionState,
    setIsSubscribed
  };
};
