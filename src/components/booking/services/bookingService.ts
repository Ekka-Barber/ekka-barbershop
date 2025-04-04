
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { BookingFormData } from "../types/booking";
import { Json } from "@/integrations/supabase/types";
import { updateCampaignConversion } from "@/utils/campaignTracking";
import { convertToArabic } from "@/utils/arabicNumerals";
import { logger } from "@/utils/logger";

/**
 * Saves booking data to the database
 * 
 * @param {BookingFormData} formData - The booking form data to save
 * @returns {Promise<any>} Promise resolving to the saved booking data
 * @throws Will throw an error if date/time are missing or if database operation fails
 */
export const saveBookingData = async (formData: BookingFormData) => {
  const { selectedDate, selectedTime, selectedServices, totalPrice, customerDetails, branch } = formData;

  if (!selectedDate || !selectedTime) {
    logger.error('Booking validation failed - missing date or time');
    throw new Error('Date and time are required');
  }

  try {
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

    if (error) {
      logger.error('Booking save failed:', error);
      throw error;
    }
    
    // Get campaign visit ID from localStorage
    const campaignVisitId = localStorage.getItem('campaign_visit_id');
    if (campaignVisitId && data[0]) {
      await updateCampaignConversion(campaignVisitId, data[0].id);
      logger.info(`Campaign conversion updated for visit ${campaignVisitId}`);
    }
    
    logger.info('Booking saved successfully:', data[0].id);
    return data;
  } catch (error) {
    logger.error('Error saving booking:', error);
    throw error;
  }
};

/**
 * Creates the raw message text for WhatsApp (not encoded)
 * 
 * @param {BookingFormData} formData - The booking form data to format into message
 * @returns {string} The formatted WhatsApp message
 */
export const createWhatsAppMessage = (formData: BookingFormData) => {
  const { selectedServices, totalPrice, selectedDate, selectedTime, selectedBarberName, customerDetails } = formData;

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    return `${convertToArabic(roundedPrice.toString())} ريال`;
  };

  // Format services as bullet points
  const serviceSummary = selectedServices
    .map(service => `• ${service.name_ar || service.name_en}: ${formatPrice(service.price)}${service.originalPrice ? ` (السعر الأصلي: ${formatPrice(service.originalPrice)})` : ''}`)
    .join('\n');

  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  const formatDate = (date: Date) => {
    // Format date in Arabic style (day/month/year)
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return convertToArabic(`${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`);
  };

  const message = `
✨ طلب حجز جديد

👤 معلومات العميل:
• الاسم: ${customerDetails.name}
• رقم الجوال: ${customerDetails.phone}
• البريد الإلكتروني: ${customerDetails.email}
${customerDetails.notes ? `• ملاحظات: ${customerDetails.notes}` : ''}

✂️ تفاصيل الحجز:
${serviceSummary}

⏰ المدة الإجمالية: ${convertToArabic(selectedServices.reduce((sum, service) => sum + service.duration, 0).toString())} دقيقة
${selectedDate && selectedTime ? `📅 التاريخ والوقت: ${formatDate(selectedDate)} - ${selectedTime}` : ''}
${selectedBarberName ? `💈 الحلاق: ${selectedBarberName}` : ''}
${totalDiscount > 0 ? `💰 الخصم: ${formatPrice(totalDiscount)}` : ''}

💵 المبلغ الإجمالي: ${formatPrice(totalPrice)}
  `.trim();

  return message;
};

/**
 * Creates an encoded message for WhatsApp URL
 * 
 * @param {BookingFormData} formData - The booking form data to encode into URL
 * @returns {string} URL-encoded WhatsApp message
 */
export const generateWhatsAppMessage = (formData: BookingFormData) => {
  const message = createWhatsAppMessage(formData);
  logger.debug('WhatsApp message generated successfully');
  
  // Encode the message for URL
  return encodeURIComponent(message);
};
