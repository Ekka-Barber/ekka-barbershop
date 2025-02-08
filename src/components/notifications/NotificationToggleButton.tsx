
import { Button } from "@/components/ui/button";
import { BellRing, BellOff } from 'lucide-react';

interface NotificationToggleButtonProps {
  isSubscribed: boolean;
  onClick: () => void;
  language: string;
}

export const NotificationToggleButton = ({
  isSubscribed,
  onClick,
  language
}: NotificationToggleButtonProps) => {
  return (
    <Button
      onClick={onClick}
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
  );
};
