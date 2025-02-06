import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PushNotificationToggle = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Check if service worker is supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY' // We'll need to set this up
      });

      // Store subscription in Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{ 
          subscription: subscription,
          created_at: new Date().toISOString()
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
          .eq('subscription', subscription);

        if (error) throw error;
      }
      
      setIsSubscribed(false);
      toast.success(language === 'ar' ? 'تم إلغاء تفعيل الإشعارات' : 'Notifications disabled');
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء إلغاء تفعيل الإشعارات' : 'Error disabling notifications');
    }
  };

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
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