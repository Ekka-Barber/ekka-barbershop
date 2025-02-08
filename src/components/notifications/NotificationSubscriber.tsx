
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
        console.error('VAPID key not available');
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

      console.log('Starting subscription process...');

      // Get existing registrations but don't unregister yet
      const registrations = await navigator.serviceWorker.getRegistrations();
      let activeRegistration = registrations.find(reg => 
        reg.active && reg.scope === window.location.origin + '/'
      );

      if (!activeRegistration) {
        console.log('No active registration found, registering new service worker');
        activeRegistration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('Service Worker registered:', activeRegistration);
      }

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready;
      console.log('Service Worker ready, checking existing subscription');
      
      // Get existing subscription
      const existingSubscription = await activeRegistration.pushManager.getSubscription();
      
      // Only unsubscribe if we have a new valid VAPID key that's different
      if (existingSubscription) {
        const currentVapidKey = new Uint8Array(existingSubscription.options.applicationServerKey as ArrayBuffer);
        const newVapidKey = new Uint8Array(Buffer.from(vapidKey, 'base64'));
        
        if (!areBuffersEqual(currentVapidKey, newVapidKey)) {
          console.log('VAPID key changed, unsubscribing from existing subscription');
          await existingSubscription.unsubscribe();
        } else {
          console.log('Using existing subscription with same VAPID key');
          setIsSubscribed(true);
          return;
        }
      }

      console.log('Creating new push subscription');
      const subscription = await activeRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('Push subscription created:', subscription.endpoint);

      // Get platform details
      const platformDetails = await notificationManager.getPlatformDetails();

      // Store subscription
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
        
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ 
            status: 'expired' as NotificationStatus,
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
