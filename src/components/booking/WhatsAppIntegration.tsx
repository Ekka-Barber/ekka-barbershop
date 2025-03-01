
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { openExternalLink } from "@/utils/deepLinking";
import { formatWhatsAppNumber } from "@/utils/phoneUtils";
import { motion } from "framer-motion";
import { WhatsApp, MessageCircleMore, ArrowRight } from "lucide-react";

interface WhatsAppIntegrationProps {
  selectedServices: any[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  customerDetails: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
  language: string;
  branch: any;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const generateWhatsAppMessage = () => {
    const serviceName = language === 'ar' ? 'name_ar' : 'name_en';
    const date = selectedDate ? selectedDate.toLocaleDateString() : '';
    
    let message = language === 'ar'
      ? `مرحباً، أود حجز موعد 📅\n\n`
      : `Hello, I would like to book an appointment 📅\n\n`;

    message += language === 'ar'
      ? `🧑‍💼 الاسم: ${customerDetails.name}\n`
      : `🧑‍💼 Name: ${customerDetails.name}\n`;
    
    message += language === 'ar'
      ? `📱 رقم الهاتف: ${customerDetails.phone}\n`
      : `📱 Phone: ${customerDetails.phone}\n`;
    
    if (customerDetails.email) {
      message += language === 'ar'
        ? `✉️ البريد الالكتروني: ${customerDetails.email}\n`
        : `✉️ Email: ${customerDetails.email}\n`;
    }

    // Services
    message += language === 'ar' ? `\n✂️ الخدمات المطلوبة:\n` : `\n✂️ Requested Services:\n`;
    selectedServices.forEach((service, index) => {
      message += `${index + 1}. ${service[serviceName]} - ${service.price} ${language === 'ar' ? 'ريال' : 'SAR'}\n`;
    });

    message += language === 'ar'
      ? `\n💰 المجموع: ${totalPrice} ريال\n`
      : `\n💰 Total: ${totalPrice} SAR\n`;

    // Date and time
    if (selectedDate && selectedTime) {
      message += language === 'ar'
        ? `\n🗓️ التاريخ والوقت: ${date} - ${selectedTime}\n`
        : `\n🗓️ Date & Time: ${date} - ${selectedTime}\n`;
    }

    // Barber
    if (selectedBarberName) {
      message += language === 'ar'
        ? `\n💈 الحلاق: ${selectedBarberName}\n`
        : `\n💈 Barber: ${selectedBarberName}\n`;
    }

    // Notes
    if (customerDetails.notes) {
      message += language === 'ar'
        ? `\n📝 ملاحظات: ${customerDetails.notes}\n`
        : `\n📝 Notes: ${customerDetails.notes}\n`;
    }

    return encodeURIComponent(message);
  };

  const handleWhatsAppClick = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        const whatsappNumber = formatWhatsAppNumber(branch?.whatsapp_number);
        
        if (!whatsappNumber) {
          console.error('Invalid WhatsApp number');
          setIsGenerating(false);
          return;
        }
        
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
        
        openExternalLink(whatsappUrl);
      } catch (error) {
        console.error('Error opening WhatsApp:', error);
      } finally {
        setIsGenerating(false);
      }
    }, 800); // Small delay for animation
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">
          {language === 'ar' ? 'تأكيد الحجز عبر واتساب' : 'Confirm Booking via WhatsApp'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' 
            ? 'انقر على الزر أدناه لإرسال تفاصيل الحجز عبر واتساب' 
            : 'Click the button below to send your booking details via WhatsApp'}
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePreview}
          className="flex items-center gap-2"
        >
          <MessageCircleMore className="h-4 w-4" />
          {language === 'ar' ? 'معاينة الرسالة' : 'Preview Message'}
        </Button>
      </div>
      
      {previewMode && (
        <motion.div 
          className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 text-sm whitespace-pre-line max-h-60 overflow-y-auto"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="text-xs text-muted-foreground mb-2">
            {language === 'ar' ? 'معاينة الرسالة:' : 'Message Preview:'}
          </div>
          {decodeURIComponent(generateWhatsAppMessage())}
        </motion.div>
      )}

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleWhatsAppClick}
          disabled={isGenerating}
          className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-medium flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              {language === 'ar' ? 'جارٍ التحميل...' : 'Loading...'}
            </span>
          ) : (
            <>
              <WhatsApp className="h-5 w-5" />
              <span>
                {language === 'ar' ? 'تأكيد عبر واتساب' : 'Confirm via WhatsApp'}
              </span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </motion.div>
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        {language === 'ar' 
          ? 'سيتم فتح تطبيق واتساب تلقائيًا لإرسال رسالة إلى صالون الحلاقة' 
          : 'WhatsApp will open automatically to send a message to the barbershop'}
      </p>
    </motion.div>
  );
};
