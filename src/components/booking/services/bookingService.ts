import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { BookingFormData } from "../types/booking";
import { Json } from "@/integrations/supabase/types";

export const saveBookingData = async (formData: BookingFormData) => {
  const { selectedDate, selectedTime, selectedServices, totalPrice, customerDetails, branch } = formData;

  if (!selectedDate || !selectedTime) {
    throw new Error('Date and time are required');
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      customer_name: customerDetails.name,
      customer_phone: customerDetails.phone,
      customer_email: customerDetails.email,
      customer_notes: customerDetails.notes,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      duration_minutes: selectedServices.reduce((sum, service) => sum + service.duration, 0),
      services: selectedServices as unknown as Json,
      total_price: totalPrice,
      branch_id: branch?.id || null,
      source: 'website',
      browser_info: {
        userAgent: navigator.userAgent,
        language: navigator.language,
      } as Json
    })
    .select();

  if (error) throw error;
  return data;
};

export const generateWhatsAppMessage = (formData: BookingFormData) => {
  const { selectedServices, totalPrice, selectedDate, selectedTime, selectedBarberName, customerDetails, language } = formData;

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

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

  // First encode the whole message
  let encodedMessage = encodeURIComponent(message);
  
  // Replace any problematic emoji encodings
  // This ensures emojis are properly encoded for WhatsApp
  encodedMessage = encodedMessage.replace(/%E2%9C%A8/g, '✨')
    .replace(/%F0%9F%91%A4/g, '👤')
    .replace(/%E2%9C%82/g, '✂️')
    .replace(/%E2%8F%B0/g, '⏰')
    .replace(/%F0%9F%93%85/g, '📅')
    .replace(/%F0%9F%92%88/g, '💈')
    .replace(/%F0%9F%92%B0/g, '💰')
    .replace(/%F0%9F%92%B5/g, '💵');

  return encodedMessage;
};
