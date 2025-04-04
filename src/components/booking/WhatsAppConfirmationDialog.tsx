
import { useState } from "react";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * Interface for WhatsAppConfirmationDialog component props
 * @interface WhatsAppConfirmationDialogProps
 */
interface WhatsAppConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  whatsappMessage: string;
  branch?: Branch;
  selectedServices: SelectedService[];
  customerDetails: CustomerDetails;
}

/**
 * Displays a confirmation dialog before redirecting to WhatsApp
 * Shows booking summary and handles the WhatsApp redirection
 * 
 * @param {WhatsAppConfirmationDialogProps} props - Component props
 * @returns {JSX.Element} The WhatsAppConfirmationDialog component
 */
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
  const isRtl = language === 'ar';
  
  /**
   * Handles confirmation button click
   * Shows loading state and processes the redirection
   */
  const handleConfirm = () => {
    setIsLoading(true);
    // Allow UI to update before proceeding
    setTimeout(() => {
      onConfirm();
      setIsLoading(false);
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("max-w-md", isRtl ? "rtl" : "")}>
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
        
        <div className="border rounded-md p-3 bg-gray-50">
          <h4 className="text-sm font-medium mb-1">
            {language === 'ar' ? 'معلومات الحجز:' : 'Booking information:'}
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>{language === 'ar' ? 'الاسم:' : 'Name:'}</strong> {customerDetails.name}</p>
            {selectedServices.length > 0 && (
              <p>
                <strong>{language === 'ar' ? 'الخدمات:' : 'Services:'}</strong> 
                {selectedServices.map(s => language === 'ar' ? s.name_ar : s.name_en).join(', ')}
              </p>
            )}
            {branch && (
              <p><strong>{language === 'ar' ? 'الفرع:' : 'Branch:'}</strong> {isRtl ? branch.name_ar : branch.name}</p>
            )}
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="sm:flex-1">
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="sm:flex-1 gap-2 bg-[#25D366] hover:bg-[#128C7E]" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {language === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {language === 'ar' ? 'متابعة إلى واتساب' : 'Continue to WhatsApp'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
