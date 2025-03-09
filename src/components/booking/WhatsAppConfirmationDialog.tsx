
import { useState } from "react";
import { AlertCircle, Send } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";

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
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
    setIsLoading(false);
  };
  
  // Format the message for display by replacing URL encoding with line breaks
  const formattedMessage = whatsappMessage.replace(/%0a/g, '\n');
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'مراجعة تفاصيل الحجز قبل إرسالها عبر واتساب'
              : 'Review booking details before sending via WhatsApp'}
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 font-medium">
            {language === 'ar' 
              ? 'الحجز يعتبر غير مؤكد حتى نقوم بالرد عليك بالتأكيد' 
              : 'Booking is considered unconfirmed until we respond with confirmation'}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 my-4">
          <h3 className="text-sm font-medium">
            {language === 'ar' ? 'معاينة الرسالة' : 'Message Preview'}:
          </h3>
          <Card className="bg-[#F6F6F6] border-[#E2E2E2]">
            <CardContent className="p-4">
              <pre className="text-xs whitespace-pre-wrap font-sans text-gray-800 rtl:text-right ltr:text-left">
                {formattedMessage}
              </pre>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="sm:flex-1"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleConfirm}
            className="sm:flex-1 gap-2"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
            {language === 'ar' ? 'متابعة إلى واتساب' : 'Continue to WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
