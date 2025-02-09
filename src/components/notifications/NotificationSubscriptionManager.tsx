
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useNotificationSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [platform, setPlatform] = useState<string>('web');
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }

    // Get VAPID key from environment
    setVapidKey(process.env.VITE_VAPID_PUBLIC_KEY || null);

    // Detect platform
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      setPlatform('ios');
    } else if (/Android/.test(navigator.userAgent)) {
      setPlatform('android');
    }

    // Check if already subscribed
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    };

    if ('serviceWorker' in navigator) {
      checkSubscription();
    }
  }, []);

  return {
    isSubscribed,
    vapidKey,
    platform,
    permissionState,
    setIsSubscribed,
  };
};
