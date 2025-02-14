
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BookingConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  language: string;
}

export const BookingConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
  language,
}: BookingConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-center">
          <DialogTitle className="text-center">
            {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
          </DialogTitle>
          <DialogDescription className="space-y-2 text-center">
            {language === 'ar' ? (
              <p className="text-center">
                حجزك هذا <span className="font-bold text-[#ea384c]">غير مؤكد</span>، تأكيد الحجز سيتم عن طريق الواتساب
              </p>
            ) : (
              <p className="text-center">
                This booking is <span className="font-bold text-[#ea384c]">unconfirmed</span>, booking confirmation will be through WhatsApp
              </p>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
          >
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
