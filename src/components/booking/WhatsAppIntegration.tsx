
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { Branch } from "./types/booking";

interface WhatsAppIntegrationProps {
  selectedServices: any[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: any;
  language: string;
  branch?: Branch;
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
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [isWhatsAppAvailable, setIsWhatsAppAvailable] = useState(false);
  
  // Get the correct display date by adjusting for after-midnight slots
  const displayDate = getBookingDisplayDate(selectedDate, selectedTime);

  useEffect(() => {
    // Check if WhatsApp is available for this branch
    setIsWhatsAppAvailable(!!branch?.whatsapp_number);
    
    // Create the WhatsApp message with booking details
    if (customerDetails?.name && displayDate && selectedTime && branch?.whatsapp_number) {
      const services = selectedServices.map(service => 
        language === 'ar' ? service.name_ar : service.name_en
      ).join(", ");
      
      const formattedDate = format(displayDate, "dd/MM/yyyy");
      
      // Create the message in the appropriate language
      const message = language === 'ar'
        ? `أود حجز موعد: %0a
          الاسم: ${customerDetails.name} %0a
          الرقم: ${customerDetails.phone || '-'} %0a
          التاريخ: ${formattedDate} %0a
          الوقت: ${selectedTime} %0a
          الخدمات: ${services} %0a
          الحلاق: ${selectedBarberName || '-'} %0a
          السعر الاجمالي: ${totalPrice} ريال %0a
          ${customerDetails.notes ? `ملاحظات: ${customerDetails.notes}` : ''}`
        : `I'd like to book an appointment: %0a
          Name: ${customerDetails.name} %0a
          Phone: ${customerDetails.phone || '-'} %0a
          Date: ${formattedDate} %0a
          Time: ${selectedTime} %0a
          Services: ${services} %0a
          Barber: ${selectedBarberName || '-'} %0a
          Total Price: ${totalPrice} SAR %0a
          ${customerDetails.notes ? `Notes: ${customerDetails.notes}` : ''}`;
          
      setWhatsappMessage(message);
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
