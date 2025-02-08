
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BellRing } from "lucide-react";

interface NotificationPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const NotificationPermissionDialog = ({
  open,
  onOpenChange,
  onAccept,
}: NotificationPermissionDialogProps) => {
  const { t, language } = useLanguage();
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'other'>('other');

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setDeviceType('ios');
    } else if (/android/.test(userAgent)) {
      setDeviceType('android');
    }
  }, []);

  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto bg-[#C4A36F]/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <BellRing className="h-6 w-6 text-[#C4A36F]" />
          </div>
          <DialogTitle className="text-center">
            {language === 'ar' 
              ? 'تفعيل الإشعارات'
              : 'Enable Notifications'
            }
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4 pb-4 text-center">
          <p>
            {language === 'ar'
              ? 'احصل على تنبيهات حول:'
              : 'Get notifications about:'
            }
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {(language === 'ar' ? [
              '🎉 العروض الخاصة والخصومات',
              '📅 تذكير بمواعيدك',
              '✨ الخدمات الجديدة'
            ] : [
              '🎉 Special offers and discounts',
              '📅 Appointment reminders',
              '✨ New services'
            ]).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          
          {deviceType === 'ios' && (
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? 'تأكد من إضافة التطبيق إلى الشاشة الرئيسية أولاً'
                : 'Make sure to add the app to your home screen first'
              }
            </p>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleAccept}
            className="bg-[#C4A36F] hover:bg-[#B39260] text-white"
          >
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {language === 'ar' ? 'ليس الآن' : 'Not Now'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;
