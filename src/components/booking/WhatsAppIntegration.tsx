import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingFormData } from "./types/booking";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { generateWhatsAppMessage, saveBookingData } from "./services/bookingService";
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "@/utils/phoneUtils";
import { openExternalLink } from "@/utils/deepLinking";

export const WhatsAppIntegration = (props: BookingFormData) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      
      await saveBookingData(props);

      const formattedNumber = formatWhatsAppNumber(props.branch.whatsapp_number);
      if (!formattedNumber) {
        throw new Error('Invalid WhatsApp number format');
      }

      const whatsappURL = `https://wa.me/${formattedNumber}?text=${generateWhatsAppMessage(props)}`;
      openExternalLink(whatsappURL);
      
      setIsConfirmDialogOpen(false);
      toast({
        description: t('whatsapp.opened')
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

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleBookingRequest}
        className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? t('processing') : t('confirm.details')}
      </Button>

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
