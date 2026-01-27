
import { WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';

import { isOnline, listenForOnlineStatusChanges } from '@shared/services/offlineSupport';
import { useToast } from "@shared/ui/components/use-toast";

import { useLanguage } from "@/contexts/LanguageContext";

export const OfflineNotification = () => {
  const [isOffline, setIsOffline] = useState(!isOnline());
  const { t, language } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    // Initial check
    setIsOffline(!isOnline());
    
    // Listen for changes
    const cleanup = listenForOnlineStatusChanges((online) => {
      setIsOffline(!online);
      
      if (online) {
        toast({
          title: t('online.status.restored') || 
            (language === 'ar' ? 'تم استعادة الاتصال' : 'Connection restored'),
          description: t('online.status.restored.desc') || 
            (language === 'ar' ? 'أنت متصل بالإنترنت الآن' : 'You are now connected to the internet'),
          variant: "default",
          duration: 3000,
        });
      } else {
        toast({
          title: t('online.status.offline') || 
            (language === 'ar' ? 'أنت غير متصل بالإنترنت' : 'You are offline'),
          description: t('online.status.offline.desc') || 
            (language === 'ar' ? 'لا يزال بإمكانك استخدام بعض ميزات التطبيق' : 'You can still use some app features'),
          variant: "destructive",
          duration: 5000,
        });
      }
    });
    
    return cleanup;
  }, [toast, t, language]);

  if (!isOffline) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 px-4 py-2 text-yellow-800 shadow-lg z-50 ${language === 'ar' ? 'rtl' : 'ltr'} mb-[env(safe-area-inset-bottom)]`}>
      <div className="flex items-center justify-center gap-2">
        <WifiOff size={18} className="text-yellow-600" />
        <p className="text-sm font-medium">
          {language === 'ar' 
            ? 'أنت حاليًا غير متصل بالإنترنت. بعض الميزات قد لا تعمل.'
            : 'You are currently offline. Some features may not work.'}
        </p>
      </div>
    </div>
  );
};
