
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, MessageSquare } from "lucide-react";

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
  language
}: BookingConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#f8f8f8] to-white" aria-describedby="booking-confirm-description">
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
          </DialogTitle>
          <DialogDescription id="booking-confirm-description" className="text-center space-y-2">
            {language === 'ar' ? (
              <>
                <p className="text-base">
                  حجزك هذا <span className="font-bold text-[#ea384c]">غير مؤكد</span>
                </p>
                <p className="text-sm text-gray-600">سيتم التأكيد بالرد عليك عن طريق الواتساب</p>
              </>
            ) : (
              <>
                <p className="text-base">
                  This booking is <span className="font-bold text-[#ea384c]">unconfirmed</span>
                </p>
                <p className="text-sm text-gray-500">
                  Booking confirmation will be through WhatsApp
                </p>
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:order-1">
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading} 
            className="bg-[#25D366] hover:bg-[#128C7E] sm:order-2 flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {isLoading 
              ? language === 'ar' ? 'جاري التأكيد...' : 'Confirming...' 
              : language === 'ar' ? 'تأكيد' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
