
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
        throw new Error('VAPID key not available');
      }

      // Check if running in standalone mode (PWA or added to home screen)
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

      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready, proceeding with subscription');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey
      });

      console.log('Push subscription successful:', subscription.endpoint);

      // Store subscription with minimal data
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

  return {
    subscribeUser,
    unsubscribeUser
  };
};
