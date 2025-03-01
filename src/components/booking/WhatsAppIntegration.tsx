
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingFormData } from "./types/booking";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { generateWhatsAppMessage, saveBookingData } from "./services/bookingService";
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "@/utils/phoneUtils";
import { openExternalLink } from "@/utils/deepLinking";
import { MessageSquare } from "lucide-react";

export const WhatsAppIntegration = (props: BookingFormData) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMessagePreview, setShowMessagePreview] = useState(false);

  const isFormValid = () => {
    if (!props.customerDetails.name.trim()) {
      showError(t('enter.name'));
      return false;
    }
    if (!props.customerDetails.phone.trim() || props.customerDetails.phone.length !== 10) {
      showError(t('enter.valid.phone'));
      return false;
    }
    if (!props.customerDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(props.customerDetails.email)) {
      showError(t('enter.valid.email'));
      return false;
    }
    if (!props.selectedDate || !props.selectedTime) {
      showError(t('select.date.time'));
      return false;
    }

    if (!props.branch?.whatsapp_number || !isValidWhatsAppNumber(props.branch.whatsapp_number)) {
      console.error('Invalid WhatsApp number:', props.branch?.whatsapp_number);
      showError(t('whatsapp.missing'));
      return false;
    }

    return true;
  };

  const showError = (message: string) => {
    toast({
      title: t('booking.alert'),
      description: message,
      variant: "destructive"
    });
  };

  const handleBookingRequest = () => {
    if (!isFormValid()) return;
    setIsConfirmDialogOpen(true);
  };

  const handleBookingConfirmation = async () => {
    if (!props.branch?.whatsapp_number) {
      showError(t('whatsapp.missing'));
      return;
    }

    try {
      setIsLoading(true);
      
      try {
        await saveBookingData(props);
      } catch (error: any) {
        console.error('Booking error:', error);
        showError(props.language === 'ar' 
          ? 'حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مرة أخرى.'
          : 'Error saving booking. Please try again.');
        return;
      }

      const formattedNumber = formatWhatsAppNumber(props.branch.whatsapp_number);
      if (!formattedNumber) {
        throw new Error('Invalid WhatsApp number format');
      }

      const whatsappURL = `https://wa.me/${formattedNumber}?text=${generateWhatsAppMessage(props)}`;
      openExternalLink(whatsappURL);
      
      setIsConfirmDialogOpen(false);
      toast({
        description: t('whatsapp.opened'),
      });
    } catch (error) {
      console.error('Booking error:', error);
      showError(props.language === 'ar' 
        ? 'حدث خطأ أثناء حفظ الحجز. يرجى المحاولة مرة أخرى.'
        : 'Error saving booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const previewMessage = () => {
    setShowMessagePreview(!showMessagePreview);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Button 
          onClick={handleBookingRequest}
          className="w-full h-14 text-lg font-medium bg-[#25D366] hover:bg-[#128C7E] text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <MessageSquare className="h-5 w-5" />
          {isLoading ? t('processing') : props.language === 'ar' ? 'تأكيد الحجز عبر واتساب' : 'Confirm via WhatsApp'}
        </Button>
        
        <button 
          onClick={previewMessage} 
          className="text-sm text-[#C4A484] hover:text-[#B39260] text-center transition-colors duration-200"
        >
          {showMessagePreview 
            ? (props.language === 'ar' ? 'إخفاء معاينة الرسالة' : 'Hide message preview') 
            : (props.language === 'ar' ? 'معاينة رسالة الواتساب' : 'Preview WhatsApp message')}
        </button>
        
        {showMessagePreview && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 max-h-40 overflow-y-auto">
            <div className="flex items-start space-x-2 rtl:space-x-reverse">
              <div className="h-8 w-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-700 mb-1">{props.language === 'ar' ? 'معاينة الرسالة' : 'Message Preview'}</p>
                <p className="whitespace-pre-line">{generateWhatsAppMessage(props)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BookingConfirmDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleBookingConfirmation}
        isLoading={isLoading}
        language={props.language}
      />
    </div>
  );
};
