import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from "@/types/service";

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface WhatsAppIntegrationProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: CustomerDetails;
  language: string;
  branch?: { whatsapp_number?: string | null };
}

export const WhatsAppIntegration = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  language,
  branch
}: WhatsAppIntegrationProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const generateWhatsAppMessage = () => {
    const serviceSummary = selectedServices
      .map(service => `${language === 'ar' ? service.name_ar : service.name_en}: ${formatPrice(service.price)}${service.originalPrice ? ` (السعر الأصلي: ${formatPrice(service.originalPrice)})` : ''}`)
      .join('\n');

    const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
    const totalDiscount = totalOriginalPrice - totalPrice;

    const message = `
✨ *طلب حجز جديد*

👤 *معلومات العميل:*
الاسم: ${customerDetails.name}
رقم الجوال: ${customerDetails.phone}
البريد الإلكتروني: ${customerDetails.email}
${customerDetails.notes ? `ملاحظات: ${customerDetails.notes}` : ''}

✂️ *تفاصيل الحجز:*
${serviceSummary}

⏰ المدة الإجمالية: ${selectedServices.reduce((sum, service) => sum + service.duration, 0)} دقيقة
${selectedDate && selectedTime ? `📅 التاريخ والوقت: ${format(selectedDate, 'dd/MM/yyyy')} - ${selectedTime}` : ''}
${selectedBarberName ? `💈 الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 الخصم: ${formatPrice(totalDiscount)}` : ''}

💵 *المبلغ الإجمالي: ${formatPrice(totalPrice)}*
    `.trim();

    return encodeURIComponent(message);
  };

  const isFormValid = () => {
    if (!customerDetails.name.trim()) {
      showError(t('enter.name'));
      return false;
    }
    if (!customerDetails.phone.trim() || customerDetails.phone.length !== 10) {
      showError(t('enter.valid.phone'));
      return false;
    }
    if (!customerDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      showError(t('enter.valid.email'));
      return false;
    }
    if (!selectedDate || !selectedTime) {
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
    if (!branch?.whatsapp_number) {
      showError(t('whatsapp.missing'));
      return;
    }

    try {
      setIsLoading(true);
      const whatsappNumber = branch.whatsapp_number.startsWith('+') ? 
        branch.whatsapp_number.slice(1) : 
        branch.whatsapp_number;
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;
      window.open(whatsappURL, '_blank');
      setIsConfirmDialogOpen(false);
      toast({
        description: t('whatsapp.opened'),
      });
    } catch (error) {
      showError(t('error.whatsapp'));
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

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader className="text-center">
            <DialogTitle className="text-center">
              {t('confirm.booking')}
            </DialogTitle>
            <DialogDescription className="space-y-2 text-center">
              {language === 'ar' ? (
                <p className="text-center">
                  حجزك هذا <span className="font-bold text-[#ea384c]">غير مؤكد</span>، تأكيد الحجز سيتم عن طريق الواتساب
                </p>
              ) : (
                <p className="text-center">
                  This booking is <span className="font-bold text-[#ea384c]">unconfirmed</span>, booking confirmation will be through WhatsApp
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
            <Button
              onClick={handleBookingConfirmation}
              disabled={isLoading}
            >
              {language === 'ar' ? 'تأكيد' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
