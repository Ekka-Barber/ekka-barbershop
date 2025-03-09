
import { useState } from "react";
import { AlertCircle, Send, Sparkle, Pin, User, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Branch, CustomerDetails } from "@/types/booking";
import { SelectedService } from "@/types/service";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhatsAppConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  whatsappMessage: string;
  branch?: Branch;
  selectedServices: SelectedService[];
  customerDetails: CustomerDetails;
}

export const WhatsAppConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  whatsappMessage,
  branch,
  selectedServices,
  customerDetails
}: WhatsAppConfirmationDialogProps) => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirm = () => {
    setIsLoading(true);
    onConfirm();
    setIsLoading(false);
  };
  
  // Process the message to add icon markup
  const processMessage = (message: string): string => {
    if (!message) return '';

    // Helper to wrap text with icon - always put icon before text in Arabic mode
    const wrapWithIcon = (line: string, iconName: string): string => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return '';

      // Always place icon before text in Arabic mode
      if (language === 'ar') {
        return `<icon>${iconName}</icon>${trimmedLine}`;
      }
      // For other languages, place icon after text
      return `${trimmedLine}<icon>${iconName}</icon>`;
    };

    // Process each line
    const lines = message.split('\n');
    const processedLines = lines.map(line => {
      // Skip empty lines
      if (!line.trim()) return line;

      // Special headers
      if (line.includes('طلب حجز جديد')) {
        return wrapWithIcon(line, 'sparkle');
      }
      if (line.includes('معلومات العميل')) {
        return wrapWithIcon(line, 'pin');
      }
      
      // Customer info lines
      if (line.includes('الاسم:')) {
        return wrapWithIcon(line, 'user');
      }
      if (line.includes('رقم الجوال:')) {
        return wrapWithIcon(line, 'phone');
      }
      if (line.includes('البريد الإلكتروني:')) {
        return wrapWithIcon(line, 'mail');
      }
      
      return line;
    });
    
    return processedLines.join('\n');
  };
  
  // Format the message for display by replacing URL encoding with line breaks
  const formattedMessage = whatsappMessage.replace(/%0a/g, '\n');
  const processedMessage = processMessage(formattedMessage);
  
  // Render the message with icons - ensure proper RTL rendering
  const renderMessageWithIcons = (message: string) => {
    if (!message) return null;
    
    const parts = message.split(/<icon>(.*?)<\/icon>/);
    
    return parts.map((part, index) => {
      // Even indices are text, odd indices are icon names
      if (index % 2 === 0) {
        return part;
      }
      
      // Render the appropriate icon with RTL-appropriate styling
      const iconClass = language === 'ar' 
        ? "h-4 w-4 inline ml-1 mr-0.5 text-gray-600" 
        : "h-4 w-4 inline mx-1 text-gray-600";
        
      switch (part) {
        case 'sparkle':
          return <Sparkle key={index} className={`${iconClass} text-amber-500`} />;
        case 'pin':
          return <Pin key={index} className={`${iconClass} text-red-500`} />;
        case 'user':
          return <User key={index} className={iconClass} />;
        case 'phone':
          return <Phone key={index} className={iconClass} />;
        case 'mail':
          return <Mail key={index} className={iconClass} />;
        default:
          return null;
      }
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {language === 'ar' ? 'تأكيد الحجز' : 'Booking Confirmation'}
          </DialogTitle>
          <DialogDescription>
            {language === 'ar' 
              ? 'مراجعة تفاصيل الحجز قبل إرسالها عبر واتساب'
              : 'Review booking details before sending via WhatsApp'}
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-600 font-medium">
            {language === 'ar' 
              ? 'الحجز يعتبر غير مؤكد حتى نقوم بالرد عليك بالتأكيد' 
              : 'Booking is considered unconfirmed until we respond with confirmation'}
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4 my-4">
          <h3 className="text-sm font-medium">
            {language === 'ar' ? 'معاينة الرسالة' : 'Message Preview'}:
          </h3>
          <Card className="bg-[#F0F2F5] border-[#D1D7DB] shadow-sm">
            <CardContent className="p-0">
              <div className="flex flex-col p-2.5 rounded-md">
                {language === 'ar' ? (
                  <div className="self-start h-3 w-3 mb-1 rotate-180">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                      <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                      <path fill="#DCF8C6" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
                    </svg>
                  </div>
                ) : (
                  <div className="self-end h-3 w-3 mb-1">
                    <svg viewBox="0 0 8 13" width="8" height="13">
                      <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path>
                      <path fill="#DCF8C6" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"></path>
                    </svg>
                  </div>
                )}
                <ScrollArea className="h-[180px] max-h-[180px]">
                  <div className={`p-3 bg-[#DCF8C6] shadow-sm ${language === 'ar' ? 'rounded-lg rounded-tl-none mr-1 text-right' : 'rounded-lg rounded-tr-none ml-1 text-left'}`}>
                    <pre className="text-xs whitespace-pre-wrap font-sans text-[#333333] leading-relaxed">
                      {renderMessageWithIcons(processedMessage)}
                    </pre>
                    <div className={`flex items-center mt-1.5 ${language === 'ar' ? 'justify-start space-x-reverse space-x-1' : 'justify-end space-x-1'}`}>
                      <span className="text-[10px] text-[#667781]">
                        {new Date().toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      <svg viewBox="0 0 18 18" width="14" height="14" className="text-[#53BDEB]">
                        <path fill="currentColor" d="M17.394 5.035l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-.427-.388a.381.381 0 0 0-.578.038l-.451.576a.497.497 0 0 0 .043.645l1.575 1.51a.38.38 0 0 0 .577-.039l7.483-9.602a.436.436 0 0 0-.076-.609z"></path>
                        <path fill="currentColor" d="M12.964 5.035l-.57-.444a.434.434 0 0 0-.609.076l-6.39 8.198a.38.38 0 0 1-.577.039l-2.614-2.556a.435.435 0 0 0-.614.007l-.505.516a.435.435 0 0 0 .007.614l3.887 3.8a.38.38 0 0 0 .577-.039l7.483-9.602a.435.435 0 0 0-.075-.609z"></path>
                      </svg>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="sm:flex-1"
          >
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleConfirm}
            className="sm:flex-1 gap-2 bg-[#25D366] hover:bg-[#128C7E]"
            disabled={isLoading}
          >
            <Send className="w-4 h-4" />
            {language === 'ar' ? 'متابعة إلى واتساب' : 'Continue to WhatsApp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
