
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'تفعيل الإشعارات' : 'Enable Notifications'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar'
              ? 'هل تريد تلقي إشعارات حول العروض والتحديثات الخاصة؟'
              : 'Would you like to receive notifications about special offers and updates?'}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'ar' ? 'لا، شكراً' : 'No, thanks'}
          </Button>
          <Button onClick={onAccept}>
            {language === 'ar' ? 'نعم، أريد' : 'Yes, enable'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPermissionDialog;
