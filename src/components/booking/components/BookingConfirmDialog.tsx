
import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export interface BookingConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const BookingConfirmDialog = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading
}: BookingConfirmDialogProps) => {
  const { language } = useLanguage();

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'ar'
              ? 'هل أنت متأكد من أنك تريد تأكيد هذا الحجز؟'
              : 'Are you sure you want to confirm this booking?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'تأكيد' : 'Confirm'}
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
