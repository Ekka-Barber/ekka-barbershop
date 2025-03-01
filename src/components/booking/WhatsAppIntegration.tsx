
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingFormData } from "./types/booking";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { createWhatsAppMessage, generateWhatsAppMessage, saveBookingData } from "./services/bookingService";
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "@/utils/phoneUtils";
import { openExternalLink } from "@/utils/deepLinking";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

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

  const toggleMessagePreview = () => {
    setShowMessagePreview(!showMessagePreview);
  };

  // Get the raw message text (not URL encoded)
  const messageText = createWhatsAppMessage(props);
  const isRtl = props.language === 'ar';

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <Button 
          onClick={handleBookingRequest}
          className="w-full h-14 text-lg font-medium bg-[#25D366] hover:bg-[#128C7E] text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          <MessageSquare className="h-5 w-5" />
          {isLoading ? t('processing') : isRtl ? 'تأكيد الحجز عبر واتساب' : 'Confirm via WhatsApp'}
        </Button>
        
        <button 
          onClick={toggleMessagePreview} 
          className="text-sm text-[#128C7E] hover:text-[#075E54] text-center transition-colors duration-200 flex items-center justify-center gap-1"
        >
          {showMessagePreview ? (
            <>
              {isRtl ? 'إخفاء معاينة الرسالة' : 'Hide message preview'} 
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              {isRtl ? 'معاينة رسالة الواتساب' : 'Preview WhatsApp message'}
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
        
        {showMessagePreview && (
          <div className={`rounded-lg overflow-hidden border border-gray-200 shadow-sm`}>
            {/* WhatsApp-like header */}
            <div className="bg-[#128C7E] text-white p-3 flex items-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center flex-shrink-0 mr-3">
                <MessageSquare className="h-5 w-5 text-[#128C7E]" />
              </div>
              <div>
                <p className="font-medium">{isRtl ? 'واتساب' : 'WhatsApp'}</p>
                <p className="text-xs opacity-80">{isRtl ? 'معاينة الرسالة' : 'Message Preview'}</p>
              </div>
            </div>
            
            {/* Message content */}
            <div className={`bg-[#ECE5DD] p-3 max-h-80 overflow-y-auto ${isRtl ? 'rtl' : 'ltr'}`}>
              <div className="flex flex-col">
                <div className="bg-white rounded-lg p-3 mb-1 shadow-sm self-start max-w-[85%] border-l-4 border-[#25D366]">
                  <p className="text-xs text-[#128C7E] font-medium mb-1">{isRtl ? 'الحجز' : 'Booking'}</p>
                  <pre className={`whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed ${isRtl ? 'text-right' : 'text-left'}`}>
                    {messageText}
                  </pre>
                  <div className="text-right mt-1">
                    <span className="text-xs text-gray-500">
                      {new Date().toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
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
