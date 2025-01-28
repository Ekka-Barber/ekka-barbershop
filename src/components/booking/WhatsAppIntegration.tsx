import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
}

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
}

export const WhatsAppIntegration = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  language
}: WhatsAppIntegrationProps) => {
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const generateWhatsAppMessage = () => {
    const serviceSummary = selectedServices
      .map(service => `${service.name}: ${formatPrice(service.price)}${service.originalPrice ? ` (السعر الأصلي: ${formatPrice(service.originalPrice)})` : ''}`)
      .join('\n');

    const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
    const totalDiscount = totalOriginalPrice - totalPrice;

    const message = `
${language === 'en' ? '*New Booking Request*' : '*طلب حجز جديد*'}

*معلومات العميل:*
الاسم: ${customerDetails.name}
رقم الجوال: ${customerDetails.phone}
${customerDetails.email ? `البريد الإلكتروني: ${customerDetails.email}` : ''}
${customerDetails.notes ? `ملاحظات: ${customerDetails.notes}` : ''}

*تفاصيل الحجز:*
${serviceSummary}

المدة الإجمالية: ${selectedServices.reduce((sum, service) => sum + service.duration, 0)} دقيقة
${selectedDate && selectedTime ? `التاريخ والوقت: ${format(selectedDate, 'dd/MM/yyyy')} - ${selectedTime}` : ''}
${selectedBarberName ? `الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `الخصم: ${formatPrice(totalDiscount)}` : ''}

*المبلغ الإجمالي: ${formatPrice(totalPrice)}*
    `.trim();

    return encodeURIComponent(message);
  };

  const handleBookingConfirmation = (branchWhatsApp?: string) => {
    if (!branchWhatsApp) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'رقم الواتساب غير متوفر' : 'WhatsApp number is missing',
        variant: "destructive"
      });
      return;
    }

    const whatsappNumber = branchWhatsApp.startsWith('+') ? branchWhatsApp.slice(1) : branchWhatsApp;
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${generateWhatsAppMessage()}`;
    window.open(whatsappURL, '_blank');
  };

  return { handleBookingConfirmation };
};