
import { convertToArabic } from "./arabicNumerals";
import { formatNumber } from "./priceFormatting";
import { SelectedService } from "@/types/service";

export const formatDuration = (duration: number, language: 'en' | 'ar' = 'en'): string => {
  const rounded = Math.round(duration);
  const formattedNumber = language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  
  if (language === 'ar') {
    // Arabic plural rules with abbreviation د instead of دقيقة
    return `${formattedNumber} د`;
  }
  
  return `${formattedNumber} mins`;
};

// Format a price with currency symbol according to language
export const formatPrice = (price: number, language: 'en' | 'ar' = 'en'): string => {
  const roundedPrice = Math.round(price);
  
  if (language === 'ar') {
    return `${convertToArabic(roundedPrice.toString())} ريال`;
  }
  
  return `${roundedPrice} SAR`;
};

// Format a price in Arabic
export const formatPriceArabic = (price: number): string => {
  const roundedPrice = Math.round(price);
  return convertToArabic(roundedPrice.toString());
};

// Format a date string to display in the proper language
export const formatDateString = (dateStr: string, language: 'en' | 'ar' = 'en'): string => {
  if (language === 'ar') {
    return convertToArabic(dateStr);
  }
  return dateStr;
};

// Generate a well-formatted WhatsApp message for booking details
export const generateWhatsAppMessage = (
  selectedServices: SelectedService[],
  totalPrice: number,
  selectedDate: Date | undefined,
  selectedTime: string | undefined,
  selectedBarberName: string | undefined,
  customerDetails: any,
  language: 'en' | 'ar' = 'en'
): string => {
  if (!selectedDate || !selectedTime || !customerDetails?.name) {
    return '';
  }

  const formatPriceWithCurrency = (price: number) => formatPrice(price, language);
  
  // Format services with pricing details
  const servicesList = selectedServices.map(service => {
    const name = language === 'ar' ? service.name_ar : service.name_en;
    const price = formatPriceWithCurrency(service.price);
    const hasDiscount = service.originalPrice && service.originalPrice > service.price;
    
    if (hasDiscount) {
      const originalPrice = formatPriceWithCurrency(service.originalPrice!);
      return `• ${name}: ${price}${service.originalPrice ? ` (${language === 'ar' ? 'السعر الأصلي' : 'Original price'}: ${originalPrice})` : ''}`;
    }
    
    return `• ${name}: ${price}`;
  }).join('\n');
  
  // Calculate discount information
  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;
  
  // Format date
  const day = selectedDate.getDate().toString().padStart(2, '0');
  const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
  const year = selectedDate.getFullYear();
  const dateString = `${day}/${month}/${year}`;
  const formattedDate = language === 'ar' ? convertToArabic(dateString) : dateString;
  
  // Calculate total duration
  const totalDuration = selectedServices.reduce((sum, service) => sum + (service.duration || 0), 0);
  const formattedDuration = language === 'ar' 
    ? `${convertToArabic(totalDuration.toString())} دقيقة`
    : `${totalDuration} minutes`;
  
  if (language === 'ar') {
    return `✨ طلب حجز جديد

👤 معلومات العميل:
• الاسم: ${customerDetails.name}
• رقم الجوال: ${customerDetails.phone || '-'}
${customerDetails.email ? `• البريد الإلكتروني: ${customerDetails.email}` : ''}
${customerDetails.notes ? `• ملاحظات: ${customerDetails.notes}` : ''}

✂️ تفاصيل الحجز:
${servicesList}

⏰ المدة الإجمالية: ${formattedDuration}
📅 التاريخ والوقت: ${formattedDate} - ${selectedTime}
${selectedBarberName ? `💈 الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 الخصم: ${formatPriceWithCurrency(totalDiscount)}` : ''}

💵 المبلغ الإجمالي: ${formatPriceWithCurrency(totalPrice)}`;
  }
  
  return `✨ New Booking Request

👤 Customer Information:
• Name: ${customerDetails.name}
• Phone: ${customerDetails.phone || '-'}
${customerDetails.email ? `• Email: ${customerDetails.email}` : ''}
${customerDetails.notes ? `• Notes: ${customerDetails.notes}` : ''}

✂️ Booking Details:
${servicesList}

⏰ Total Duration: ${formattedDuration}
📅 Date & Time: ${formattedDate} - ${selectedTime}
${selectedBarberName ? `💈 Barber: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 Discount: ${formatPriceWithCurrency(totalDiscount)}` : ''}

💵 Total Amount: ${formatPriceWithCurrency(totalPrice)}`;
};
