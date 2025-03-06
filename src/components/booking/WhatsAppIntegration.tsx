
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkle, User, Scissors, Clock, Calendar, User2, DollarSign } from "lucide-react";
import { convertToArabic } from "@/utils/arabicNumerals";

interface WhatsAppIntegrationProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: CustomerDetails;
  branch?: Branch;
}

export const WhatsAppIntegration = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  customerDetails,
  branch
}: WhatsAppIntegrationProps) => {
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [isWhatsAppAvailable, setIsWhatsAppAvailable] = useState(false);
  const { language } = useLanguage();
  
  // Get the correct display date by adjusting for after-midnight slots
  const displayDate = getBookingDisplayDate(selectedDate, selectedTime);

  useEffect(() => {
    // Check if WhatsApp is available for this branch
    setIsWhatsAppAvailable(!!branch?.whatsapp_number);
    
    // Create the WhatsApp message with booking details
    if (customerDetails?.name && displayDate && selectedTime && branch?.whatsapp_number) {
      const formatPrice = (price: number) => {
        const roundedPrice = Math.round(price);
        return language === 'ar' 
          ? `${convertToArabic(roundedPrice.toString())} ريال`
          : `${roundedPrice} SAR`;
      };
      
      // Format services as bullet points with proper pricing
      const services = selectedServices.map(service => {
        const serviceName = language === 'ar' ? service.name_ar : service.name_en;
        const servicePrice = formatPrice(service.price);
        const hasDiscount = service.originalPrice && service.originalPrice > service.price;
        
        return hasDiscount
          ? `• ${serviceName}: ${servicePrice}${service.originalPrice ? ` (${language === 'ar' ? 'السعر الأصلي' : 'Original price'}: ${formatPrice(service.originalPrice)})` : ''}`
          : `• ${serviceName}: ${servicePrice}`;
      }).join('\n');

      const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
      const totalDiscount = totalOriginalPrice - totalPrice;
      
      const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
      const formattedDuration = language === 'ar' 
        ? `${convertToArabic(totalDuration.toString())} دقيقة` 
        : `${totalDuration} minutes`;
      
      const formattedDate = format(displayDate, 'dd/MM/yyyy');
      
      // Create the enhanced message for Arabic (with emojis and better formatting)
      const arabicMessage = `✨ طلب حجز جديد

👤 معلومات العميل:
• الاسم: ${customerDetails.name}
• رقم الجوال: ${customerDetails.phone || '-'}
${customerDetails.email ? `• البريد الإلكتروني: ${customerDetails.email}` : ''}
${customerDetails.notes ? `• ملاحظات: ${customerDetails.notes}` : ''}

✂️ تفاصيل الحجز:
${services}

⏰ المدة الإجمالية: ${formattedDuration}
📅 التاريخ والوقت: ${language === 'ar' ? convertToArabic(formattedDate) : formattedDate} - ${selectedTime}
${selectedBarberName ? `💈 الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 الخصم: ${formatPrice(totalDiscount)}` : ''}

💵 المبلغ الإجمالي: ${formatPrice(totalPrice)}`;

      // Create the message in English (also with emojis for consistency)
      const englishMessage = `✨ New Booking Request

👤 Customer Information:
• Name: ${customerDetails.name}
• Phone: ${customerDetails.phone || '-'}
${customerDetails.email ? `• Email: ${customerDetails.email}` : ''}
${customerDetails.notes ? `• Notes: ${customerDetails.notes}` : ''}

✂️ Booking Details:
${services}

⏰ Total Duration: ${formattedDuration}
📅 Date & Time: ${formattedDate} - ${selectedTime}
${selectedBarberName ? `💈 Barber: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 Discount: ${formatPrice(totalDiscount)}` : ''}

💵 Total Amount: ${formatPrice(totalPrice)}`;

      // Use the appropriate message based on language
      const finalMessage = language === 'ar' ? arabicMessage : englishMessage;
      
      // Prepare the message for WhatsApp URL (encode line breaks)
      const encodedMessage = finalMessage.replace(/\n/g, '%0a');
      setWhatsappMessage(encodedMessage);
    }
  }, [customerDetails, selectedServices, displayDate, selectedTime, language, selectedBarberName, totalPrice, branch?.whatsapp_number]);

  const handleWhatsAppClick = () => {
    if (branch?.whatsapp_number && whatsappMessage) {
      // Format the WhatsApp number
      const formattedNumber = branch.whatsapp_number.startsWith('+') 
        ? branch.whatsapp_number.substring(1) 
        : branch.whatsapp_number;
        
      // Create the WhatsApp URL
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${whatsappMessage}`;
      
      // Open WhatsApp in a new tab
      window.open(whatsappUrl, '_blank');
    }
  };

  if (!isWhatsAppAvailable) return null;

  return (
    <Button 
      onClick={handleWhatsAppClick}
      className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
      size="lg"
      disabled={!customerDetails?.name || !customerDetails?.phone}
    >
      {language === 'ar' ? 'إرسال الحجز عبر واتساب' : 'Complete booking via WhatsApp'}
    </Button>
  );
};
