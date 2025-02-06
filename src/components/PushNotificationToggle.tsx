import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PushNotificationToggle = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { language } = useLanguage();
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (installed as PWA)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isRunningStandalone);

    // Only proceed with push notification setup if running as PWA
    if (isRunningStandalone && 'serviceWorker' in navigator && 'PushManager' in window) {
      // Get VAPID key from Edge Function
      supabase.functions.invoke('get-vapid-key')
        .then(({ data }) => {
          if (data?.vapidKey) {
            setVapidKey(data.vapidKey);
            // Check subscription status
            navigator.serviceWorker.ready.then(registration => {
              registration.pushManager.getSubscription().then(subscription => {
                setIsSubscribed(!!subscription);
                // If not subscribed, request permission only once
                if (!subscription && !localStorage.getItem('notificationPromptShown')) {
                  const message = language === 'ar' 
                    ? 'هل تود تلقي إشعارات من إكّه للعناية بالرجل؟'
                    : 'Would you like to receive notifications from Ekka Barbershop?';
                  if (confirm(message)) {
                    subscribeUser();
                  }
                  localStorage.setItem('notificationPromptShown', 'true');
                }
              });
            });
          }
        })
        .catch(console.error);
    }
  }, [vapidKey]);

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

      // Store subscription in Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{ 
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
          status: 'active'
        }]);

      if (error) throw error;

      setIsSubscribed(true);
      toast.success(language === 'ar' ? 'تم تفعيل الإشعارات بنجاح' : 'Notifications enabled successfully');
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تفعيل الإشعارات' : 'Error enabling notifications');
    }
  };

  const unsubscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove subscription from Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', subscription.endpoint);

        if (error) throw error;
      }
      
      setIsSubscribed(false);
      toast.success(language === 'ar' ? 'تم إلغاء تفعيل الإشعارات' : 'Notifications disabled');
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إلغاء تفعيل الإشعارات' : 'Error disabling notifications');
    }
  };

  // Only show the button if the app is installed as PWA
  if (!isStandalone || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return null;
  }

  return (
    <Button
      onClick={isSubscribed ? unsubscribeUser : subscribeUser}
      variant="outline"
      className="mt-4"
    >
      {isSubscribed ? 
        (language === 'ar' ? 'إلغاء تفعيل الإشعارات' : 'Disable Notifications') :
        (language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications')
      }
    </Button>
  );
};

export default PushNotificationToggle;