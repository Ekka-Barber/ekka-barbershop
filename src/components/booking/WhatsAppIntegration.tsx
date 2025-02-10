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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      showError(language === 'ar' ? 'الرجاء إدخال الاسم' : 'Please enter your name');
      return false;
    }
    if (!customerDetails.phone.trim() || customerDetails.phone.length !== 10) {
      showError(language === 'ar' ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
      return false;
    }
    if (!customerDetails.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      showError(language === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return false;
    }
    if (!selectedDate || !selectedTime) {
      showError(language === 'ar' ? 'الرجاء اختيار التاريخ والوقت' : 'Please select date and time');
      return false;
    }
    return true;
  };

  const showError = (message: string) => {
    toast({
      title: language === 'ar' ? 'تنبيه' : 'Alert',
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
      showError(language === 'ar' ? 'رقم الواتساب غير متوفر' : 'WhatsApp number is missing');
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
        description: language === 'ar' ? 
          'تم فتح واتساب لتأكيد حجزك' : 
          'WhatsApp opened to confirm your booking',
      });
    } catch (error) {
      showError(language === 'ar' ? 
        'حدث خطأ أثناء فتح واتساب' : 
        'Error opening WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-muted-foreground space-y-1">
        <p>حجزك هذا <span className="font-bold text-red-500">غير مؤكد</span>، تأكيد الحجز سيتم عن طريق الواتساب</p>
        <p>{language === 'ar' ? '📲 سيصلك ردنا بالتأكيد قريباً! ✔️' : '📲 You\'ll receive our confirmation shortly! ✔️'}</p>
      </div>
      <Button 
        onClick={handleBookingRequest}
        className="w-full h-14 text-lg font-medium bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? 
          (language === 'ar' ? 'جاري المعالجة...' : 'Processing...') : 
          (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')}
      </Button>

      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking'}
            </DialogTitle>
            <DialogDescription>
              حجزك هذا <span className="font-bold text-red-500">غير مؤكد</span>، تأكيد الحجز سيتم عن طريق الواتساب
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-2 rtl:space-x-reverse">
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
