
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notificationManager } from '@/services/notificationManager';
import type { NotificationStatus } from '@/services/notificationManager';
import type { Json } from '@/integrations/supabase/types';

interface NotificationSubscriberProps {
  vapidKey: string;
  platform: string;
  permissionState: NotificationPermission;
  setIsSubscribed: (value: boolean) => void;
  language: string;
}

export const useNotificationSubscriber = ({
  vapidKey,
  platform,
  permissionState,
  setIsSubscribed,
  language
}: NotificationSubscriberProps) => {
  const subscribeUser = async () => {
    try {
      if (!vapidKey) {
        console.error('[Notification] VAPID key not available');
        throw new Error('Push notification configuration not available');
      }

      // Check if running in standalone mode (PWA)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone;

      if (!isStandalone) {
        toast.error(
          language === 'ar' 
            ? 'يجب تثبيت التطبيق أولاً'
            : 'Please install the app first'
        );
        return;
      }

      console.log('[Notification] Starting subscription process...');

      // Get existing registrations and unregister them to ensure clean state
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        console.log('[Notification] Unregistering existing service worker:', registration.scope);
        await registration.unregister();
      }

      // Register new service worker
      console.log('[Notification] Registering new service worker');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      console.log('[Notification] Service Worker registered:', registration);

      // Wait for the service worker to be ready and active
      if (registration.installing) {
        console.log('[Notification] Service worker installing');
        await new Promise<void>((resolve) => {
          registration.installing?.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              console.log('[Notification] Service worker activated');
              resolve();
            }
          });
        });
      }

      // Get existing subscription
      console.log('[Notification] Checking existing subscription');
      const existingSubscription = await registration.pushManager.getSubscription();
      
      // Only unsubscribe if we have a new valid VAPID key that's different
      if (existingSubscription) {
        const currentVapidKey = new Uint8Array(existingSubscription.options.applicationServerKey as ArrayBuffer);
        const newVapidKey = new Uint8Array(Buffer.from(vapidKey, 'base64'));
        
        if (!areBuffersEqual(currentVapidKey, newVapidKey)) {
          console.log('[Notification] VAPID key changed, unsubscribing');
          await existingSubscription.unsubscribe();
        } else {
          console.log('[Notification] Using existing subscription');
          setIsSubscribed(true);
          return;
        }
      }

      // Create new push subscription with retry logic
      let subscription;
      let retryCount = 0;
      const maxRetries = 3;

      while (!subscription && retryCount < maxRetries) {
        try {
          console.log(`[Notification] Attempting to create push subscription (attempt ${retryCount + 1})`);
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey
          });
          console.log('[Notification] Push subscription created:', subscription.endpoint);
        } catch (error) {
          console.error(`[Notification] Subscription attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      if (!subscription) {
        throw new Error('Failed to create push subscription after retries');
      }

      // Get platform details
      const platformDetails = await notificationManager.getPlatformDetails();
      console.log('[Notification] Platform details:', platformDetails);

      // Store subscription with retry logic
      let stored = false;
      retryCount = 0;

      while (!stored && retryCount < maxRetries) {
        try {
          const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
              endpoint: subscription.endpoint,
              p256dh: subscription.toJSON().keys.p256dh,
              auth: subscription.toJSON().keys.auth,
              status: 'active' as NotificationStatus,
              device_type: platform,
              permission_state: permissionState,
              last_active: new Date().toISOString(),
              platform_details: platformDetails,
              error_count: 0,
              retry_count: 0,
              last_error_at: null,
              last_error_details: null
            });

          if (error) throw error;
          stored = true;
          console.log('[Notification] Subscription stored successfully');
        } catch (error) {
          console.error(`[Notification] Storage attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      setIsSubscribed(true);
      toast.success(
        language === 'ar' 
          ? 'تم تفعيل الإشعارات بنجاح'
          : 'Notifications enabled successfully'
      );
    } catch (err) {
      console.error('[Notification] Error in subscription process:', err);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء تفعيل الإشعارات'
          : 'Error enabling notifications'
      );
      // Attempt cleanup
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log('[Notification] Cleaned up failed subscription');
        }
      } catch (cleanupError) {
        console.error('[Notification] Error during cleanup:', cleanupError);
      }
    }
  };

  const unsubscribeUser = async () => {
    try {
      console.log('[Notification] Starting unsubscribe process');
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('[Notification] Unsubscribed from push notifications');
        
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ 
            status: 'expired' as NotificationStatus,
            permission_state: 'denied',
            last_active: new Date().toISOString()
          })
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
        console.log('[Notification] Updated subscription status in database');
      }
      
      setIsSubscribed(false);
      toast.success(
        language === 'ar' 
          ? 'تم إلغاء تفعيل الإشعارات'
          : 'Notifications disabled'
      );
    } catch (err) {
      console.error('[Notification] Error unsubscribing:', err);
      toast.error(
        language === 'ar' 
          ? 'حدث خطأ أثناء إلغاء تفعيل الإشعارات'
          : 'Error disabling notifications'
      );
    }
  };

  // Helper function to compare ArrayBuffers
  const areBuffersEqual = (buf1: Uint8Array, buf2: Uint8Array) => {
    if (buf1.byteLength !== buf2.byteLength) return false;
    return buf1.every((val, i) => val === buf2[i]);
  };

  return {
    subscribeUser,
    unsubscribeUser
  };
};
