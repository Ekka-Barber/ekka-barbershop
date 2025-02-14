
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookingFormData } from "./types/booking";
import { BookingConfirmDialog } from "./components/BookingConfirmDialog";
import { generateWhatsAppMessage, saveBookingData } from "./services/bookingService";

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
      
      await saveBookingData(props);

      const whatsappNumber = props.branch.whatsapp_number.startsWith('+') ? 
        props.branch.whatsapp_number.slice(1) : 
        props.branch.whatsapp_number;
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage(props)}`;
      window.open(whatsappURL, '_blank');
      setIsConfirmDialogOpen(false);
      toast({
        description: t('whatsapp.opened'),
      });
    } catch (error) {
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
