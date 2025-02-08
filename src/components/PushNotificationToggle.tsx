
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NotificationPermissionDialog from './NotificationPermissionDialog';
import { BellRing, BellOff } from 'lucide-react';

const PushNotificationToggle = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { language } = useLanguage();
  const [vapidKey, setVapidKey] = useState<string | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Check if the app is running in standalone mode (installed as PWA)
    const isRunningStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsStandalone(isRunningStandalone);

    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    }

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

      // Store subscription in Supabase with device type
      const { error } = await supabase
        .from('push_subscriptions')
        .insert([{ 
          endpoint: subscription.endpoint,
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
          status: 'active',
          device_type: deviceType
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
        
        // Update subscription status in Supabase
        const { error } = await supabase
          .from('push_subscriptions')
          .update({ status: 'inactive' })
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

  // For iOS, show installation instruction if not installed
  if (deviceType === 'ios' && !isStandalone) {
    return (
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-800">
          {language === 'ar' 
            ? 'لتفعيل الإشعارات، يرجى إضافة التطبيق إلى الشاشة الرئيسية أولاً'
            : 'To enable notifications, please add this app to your home screen first'
          }
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => isSubscribed ? unsubscribeUser() : setDialogOpen(true)}
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
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAccept={subscribeUser}
      />
    </>
  );
};

export default PushNotificationToggle;

