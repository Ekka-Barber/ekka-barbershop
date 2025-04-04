
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, MessageSquare, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isRtl = language === 'ar';
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "sm:max-w-md bg-gradient-to-b from-[#f8f8f8] to-white",
          isRtl ? "rtl" : ""
        )}
        aria-describedby="booking-confirm-description"
      >
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <DialogTitle className="text-center text-xl">
            {isRtl ? 'تأكيد الحجز' : 'Confirm Booking'}
          </DialogTitle>
          <DialogDescription id="booking-confirm-description" className="text-center space-y-2">
            {isRtl ? (
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
        <div className={cn(
          "flex flex-col gap-2 sm:flex-row sm:justify-center mt-2",
          isRtl ? "space-x-reverse" : ""
        )}>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className={isRtl ? "sm:order-2" : "sm:order-1"}
          >
            {isRtl ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading} 
            className={cn(
              "bg-[#25D366] hover:bg-[#128C7E] flex items-center gap-2",
              isRtl ? "sm:order-1" : "sm:order-2"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {isRtl ? 'جاري التأكيد...' : 'Confirming...'}
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                {isRtl ? 'تأكيد' : 'Confirm'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
