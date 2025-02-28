
import { useToast } from "@/hooks/use-toast";
import { BookingFormData } from "./types/booking";
import { Language } from "@/types/language";

interface WhatsAppIntegrationProps {
  branch?: any;
  selectedServices: any[];
  selectedDate?: Date;
  selectedTime?: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  totalPrice: number;
  language: Language;
}

export const WhatsAppIntegration = ({
  branch,
  selectedServices,
  selectedDate,
  selectedTime,
  customerDetails,
  totalPrice,
  language
}: WhatsAppIntegrationProps) => {
  const { toast } = useToast();

  // Format booking details for WhatsApp message
  const formatBookingMessage = (data: BookingFormData): string => {
    const {
      selectedServices,
      totalPrice,
      selectedDate,
      selectedTime,
      selectedBarberName,
      customerDetails
    } = data;

    // Format date if available
    const formattedDate = selectedDate
      ? new Intl.DateTimeFormat(language === "ar" ? "ar-SA" : "en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        }).format(selectedDate)
      : "";

    // Format services list
    const servicesList = selectedServices
      .map(
        service =>
          `- ${language === "ar" ? service.name_ar : service.name_en}: ${service.price} SAR`
      )
      .join("\n");

    // Construct message based on language
    if (language === "ar") {
      return `*طلب حجز جديد*\n\n`
        + `*الخدمات:*\n${servicesList}\n\n`
        + `*المجموع:* ${totalPrice} ريال\n\n`
        + (formattedDate && selectedTime ? `*التاريخ والوقت:* ${formattedDate} - ${selectedTime}\n\n` : "")
        + (selectedBarberName ? `*الحلاق:* ${selectedBarberName}\n\n` : "")
        + `*معلومات العميل:*\n`
        + `- الاسم: ${customerDetails.name}\n`
        + `- الجوال: ${customerDetails.phone}\n`
        + `- البريد الإلكتروني: ${customerDetails.email}\n`
        + (customerDetails.notes ? `- ملاحظات: ${customerDetails.notes}\n` : "");
    } else {
      return `*New Booking Request*\n\n`
        + `*Services:*\n${servicesList}\n\n`
        + `*Total:* ${totalPrice} SAR\n\n`
        + (formattedDate && selectedTime ? `*Date & Time:* ${formattedDate} - ${selectedTime}\n\n` : "")
        + (selectedBarberName ? `*Barber:* ${selectedBarberName}\n\n` : "")
        + `*Customer Details:*\n`
        + `- Name: ${customerDetails.name}\n`
        + `- Phone: ${customerDetails.phone}\n`
        + `- Email: ${customerDetails.email}\n`
        + (customerDetails.notes ? `- Notes: ${customerDetails.notes}\n` : "");
    }
  };

  // Open WhatsApp with formatted booking details
  const openWhatsApp = () => {
    try {
      if (!branch?.whatsapp_number) {
        toast({
          title: language === "ar" ? "خطأ" : "Error",
          description: language === "ar" ? "رقم الواتساب غير متوفر" : "WhatsApp number is missing",
          variant: "destructive"
        });
        return;
      }

      // Prepare booking data
      const bookingData: BookingFormData = {
        selectedServices,
        totalPrice,
        selectedDate,
        selectedTime,
        selectedBarberName: undefined, // This should be replaced with actual barber name
        customerDetails,
        language,
        branch
      };

      // Format the message
      const message = formatBookingMessage(bookingData);

      // Format WhatsApp number (remove + if present)
      const whatsappNumber = branch.whatsapp_number.startsWith("+")
        ? branch.whatsapp_number.substring(1)
        : branch.whatsapp_number;

      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);

      // Open WhatsApp link
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");

      toast({
        title: language === "ar" ? "تم فتح الواتساب" : "WhatsApp Opened",
        description:
          language === "ar"
            ? "تم فتح الواتساب لتأكيد حجزك"
            : "WhatsApp opened to confirm your booking"
      });
    } catch (error) {
      console.error("Error opening WhatsApp:", error);
      toast({
        title: language === "ar" ? "خطأ" : "Error",
        description:
          language === "ar"
            ? "حدث خطأ أثناء فتح الواتساب"
            : "Error opening WhatsApp",
        variant: "destructive"
      });
    }
  };

  return null; // This component doesn't render anything, it just provides the openWhatsApp function
};
