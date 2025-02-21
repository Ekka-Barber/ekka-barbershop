
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";

interface NotificationToggleButtonProps {
  isSubscribed: boolean;
  onClick: () => void;
  language: string;
}

export const NotificationToggleButton = ({
  isSubscribed,
  onClick,
  language,
}: NotificationToggleButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-5 w-5" />
          <span>
            {language === 'ar' ? 'إيقاف الإشعارات' : 'Disable Notifications'}
          </span>
        </>
      ) : (
        <>
          <Bell className="h-5 w-5" />
          <span>
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </span>
        </>
      )}
    </Button>
  );
};
