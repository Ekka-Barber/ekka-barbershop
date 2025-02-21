
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseNotificationSubscriberProps {
  vapidKey: string;
  platform: string;
  permissionState: NotificationPermission;
  setIsSubscribed: (subscribed: boolean) => void;
  language: string;
}

export const useNotificationSubscriber = ({
  vapidKey,
  platform,
  permissionState,
  setIsSubscribed,
  language,
}: UseNotificationSubscriberProps) => {
  const subscribeUser = useCallback(async () => {
    try {
      if (!vapidKey) {
        throw new Error('VAPID key not found');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      });

      const { endpoint, keys: { auth, p256dh } } = subscription.toJSON();

      await supabase.from('push_subscriptions').insert({
        endpoint,
        auth,
        p256dh,
        platform,
        status: 'active',
      });

      setIsSubscribed(true);
      toast.success(
        language === 'ar' 
          ? 'تم تفعيل الإشعارات بنجاح'
          : 'Notifications enabled successfully'
      );
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء تفعيل الإشعارات'
          : 'Error enabling notifications'
      );
    }
  }, [vapidKey, platform, setIsSubscribed, language]);

  const unsubscribeUser = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await supabase
          .from('push_subscriptions')
          .update({ status: 'inactive' })
          .eq('endpoint', subscription.endpoint);
      }

      setIsSubscribed(false);
      toast.success(
        language === 'ar'
          ? 'تم إيقاف الإشعارات بنجاح'
          : 'Notifications disabled successfully'
      );
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error(
        language === 'ar'
          ? 'حدث خطأ أثناء إيقاف الإشعارات'
          : 'Error disabling notifications'
      );
    }
  }, [setIsSubscribed, language]);

  return {
    subscribeUser,
    unsubscribeUser,
  };
};
