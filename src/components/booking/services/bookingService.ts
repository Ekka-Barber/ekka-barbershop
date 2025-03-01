
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { BookingFormData } from "../types/booking";
import { Json } from "@/integrations/supabase/types";
import { updateCampaignConversion } from "@/utils/campaignTracking";

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
  
  // Get campaign visit ID from localStorage
  const campaignVisitId = localStorage.getItem('campaign_visit_id');
  if (campaignVisitId && data[0]) {
    await updateCampaignConversion(campaignVisitId, data[0].id);
  }
  
  return data;
};

// Creates the raw message text (not encoded)
export const createWhatsAppMessage = (formData: BookingFormData) => {
  const { selectedServices, totalPrice, selectedDate, selectedTime, selectedBarberName, customerDetails, language } = formData;

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  // Format services as bullet points
  const serviceSummary = selectedServices
    .map(service => `• ${language === 'ar' ? service.name_ar : service.name_en}: ${formatPrice(service.price)}${service.originalPrice ? ` (${language === 'ar' ? 'السعر الأصلي' : 'Original price'}: ${formatPrice(service.originalPrice)})` : ''}`)
    .join('\n');

  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  const message = `
✨ ${language === 'ar' ? 'طلب حجز جديد' : 'New Booking Request'}

👤 ${language === 'ar' ? 'معلومات العميل:' : 'Customer Information:'}
${language === 'ar' ? 'الاسم' : 'Name'}: ${customerDetails.name}
${language === 'ar' ? 'رقم الجوال' : 'Phone'}: ${customerDetails.phone}
${language === 'ar' ? 'البريد الإلكتروني' : 'Email'}: ${customerDetails.email}
${customerDetails.notes ? `${language === 'ar' ? 'ملاحظات' : 'Notes'}: ${customerDetails.notes}` : ''}

✂️ ${language === 'ar' ? 'تفاصيل الحجز:' : 'Booking Details:'}
${serviceSummary}

⏰ ${language === 'ar' ? 'المدة الإجمالية' : 'Total Duration'}: ${selectedServices.reduce((sum, service) => sum + service.duration, 0)} ${language === 'ar' ? 'دقيقة' : 'minutes'}
${selectedDate && selectedTime ? `📅 ${language === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}: ${format(selectedDate, 'dd/MM/yyyy')} - ${selectedTime}` : ''}
${selectedBarberName ? `💈 ${language === 'ar' ? 'الحلاق' : 'Barber'}: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 ${language === 'ar' ? 'الخصم' : 'Discount'}: ${formatPrice(totalDiscount)}` : ''}

💵 ${language === 'ar' ? 'المبلغ الإجمالي' : 'Total Amount'}: ${formatPrice(totalPrice)}
  `.trim();

  return message;
};

// Creates an encoded message for WhatsApp URL
export const generateWhatsAppMessage = (formData: BookingFormData) => {
  const message = createWhatsAppMessage(formData);
  
  // Encode the message for URL
  return encodeURIComponent(message);
};
