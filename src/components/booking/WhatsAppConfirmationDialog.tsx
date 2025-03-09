import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
interface WhatsAppConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  whatsappMessage: string;
  branch?: Branch;
  selectedServices: SelectedService[];
  customerDetails: CustomerDetails;
}
export const WhatsAppConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  whatsappMessage,
  branch,
  selectedServices,
  customerDetails
}: WhatsAppConfirmationDialogProps) => {
  const {
    language
  } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
    setIsLoading(false);
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation'}
          </DialogTitle>
          
        </DialogHeader>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600 font-medium">
            {language === 'ar' ? 'الحجز يعتبر غير مؤكد حتى نقوم بالرد عليك بالتأكيد' : 'Booking is considered unconfirmed until we respond with confirmation'}
          </AlertDescription>
        </Alert>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleConfirm} className="sm:flex-1 gap-2 bg-[#25D366] hover:bg-[#128C7E]" disabled={isLoading}>
            <Send className="w-4 h-4" />
            {language === 'ar' ? 'متابعة إلى واتساب' : 'Continue to WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};