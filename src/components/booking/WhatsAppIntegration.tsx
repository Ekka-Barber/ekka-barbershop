
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateWhatsAppMessage } from "@/utils/formatters";

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
    
    // Create the WhatsApp message with booking details (always in Arabic)
    if (customerDetails?.name && displayDate && selectedTime && branch?.whatsapp_number) {
      // Generate the formatted message using our utility function
      const messageText = generateWhatsAppMessage(
        selectedServices,
        totalPrice,
        displayDate,
        selectedTime,
        selectedBarberName,
        customerDetails,
        branch
      );
      
      // Prepare the message for WhatsApp URL (encode line breaks)
      const encodedMessage = messageText.replace(/\n/g, '%0a');
      setWhatsappMessage(encodedMessage);
    }
  }, [customerDetails, selectedServices, displayDate, selectedTime, selectedBarberName, totalPrice, branch]);

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
