
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
      } as Json,
      device_type: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile/.test(navigator.userAgent) 
        ? 'mobile' 
        : 'desktop'
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
\u2728 *طلب حجز جديد*

\u{1F464} *معلومات العميل:*
الاسم: ${customerDetails.name}
رقم الجوال: ${customerDetails.phone}
البريد الإلكتروني: ${customerDetails.email}
${customerDetails.notes ? `ملاحظات: ${customerDetails.notes}` : ''}

\u2702\uFE0F *تفاصيل الحجز:*
${serviceSummary}

\u23F0 المدة الإجمالية: ${selectedServices.reduce((sum, service) => sum + service.duration, 0)} دقيقة
${selectedDate && selectedTime ? `\u{1F4C5} التاريخ والوقت: ${format(selectedDate, 'dd/MM/yyyy')} - ${selectedTime}` : ''}
${selectedBarberName ? `\u{1F488} الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `\u{1F4B0} الخصم: ${formatPrice(totalDiscount)}` : ''}

\u{1F4B5} *المبلغ الإجمالي: ${formatPrice(totalPrice)}*
  `.trim();

  return encodeURIComponent(message);
};
