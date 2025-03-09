
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getBookingDisplayDate } from "@/utils/dateAdjustment";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateWhatsAppMessage } from "@/utils/formatters";
import { WhatsAppConfirmationDialog } from "./WhatsAppConfirmationDialog";
import { useToast } from "@/hooks/use-toast";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { language, t } = useLanguage();
  const { toast } = useToast();
  
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

  const handleOpenWhatsApp = () => {
    if (branch?.whatsapp_number && whatsappMessage) {
      // Format the WhatsApp number
      const formattedNumber = branch.whatsapp_number.startsWith('+') 
        ? branch.whatsapp_number.substring(1) 
        : branch.whatsapp_number;
        
      // Create the WhatsApp URL
      const whatsappUrl = `https://wa.me/${formattedNumber}?text=${whatsappMessage}`;
      
      try {
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        // Show success toast
        toast({
          title: language === 'ar' ? 'تم الفتح' : 'Opened',
          description: language === 'ar' 
            ? 'تم فتح واتساب لتأكيد حجزك' 
            : 'WhatsApp opened to confirm your booking',
        });
      } catch (error) {
        // Show error toast if WhatsApp couldn't be opened
        toast({
          title: language === 'ar' ? 'خطأ' : 'Error',
          description: language === 'ar' 
            ? 'حدث خطأ أثناء فتح واتساب' 
            : 'Error opening WhatsApp',
          variant: "destructive",
        });
      }
    }
    
    // Close the dialog
    setIsDialogOpen(false);
  };

  const handleWhatsAppClick = () => {
    if (!branch?.whatsapp_number) {
      toast({
        title: language === 'ar' ? 'تنبيه' : 'Alert',
        description: language === 'ar' 
          ? 'رقم الواتساب غير متوفر' 
          : 'WhatsApp number is missing',
        variant: "destructive",
      });
      return;
    }
    
    if (!whatsappMessage) {
      toast({
        title: language === 'ar' ? 'تنبيه' : 'Alert',
        description: language === 'ar' 
          ? 'تفاصيل الحجز غير مكتملة' 
          : 'Booking details are incomplete',
        variant: "destructive",
      });
      return;
    }
    
    // Open the confirmation dialog instead of immediately opening WhatsApp
    setIsDialogOpen(true);
  };

  if (!isWhatsAppAvailable) return null;

  return (
    <>
      <Button 
        onClick={handleWhatsAppClick}
        className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
        size="lg"
        disabled={!customerDetails?.name || !customerDetails?.phone}
      >
        {language === 'ar' ? 'تأكيد تفاصيل الحجز' : t('whatsapp.button')}
      </Button>
      
      <WhatsAppConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleOpenWhatsApp}
        whatsappMessage={whatsappMessage}
        branch={branch}
        selectedServices={selectedServices}
        customerDetails={customerDetails}
      />
    </>
  );
};
