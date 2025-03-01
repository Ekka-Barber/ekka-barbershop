
import * as React from "react";
import { motion } from "framer-motion";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Service } from "@/types/service";
import { Language } from "@/types/language";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceDetailsSheetProps {
  service: Service;
  isSelected: boolean;
  language: Language;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: (service: Service) => void;
  // Additional props
  serviceName?: string;
  serviceDescription?: string | null;
  finalPrice?: number;
  hasDiscount?: boolean;
}

export const ServiceDetailsSheet = ({
  service,
  isSelected,
  language,
  isOpen,
  setIsOpen,
  onSelect,
  serviceName,
  serviceDescription,
  finalPrice,
  hasDiscount
}: ServiceDetailsSheetProps) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(service);
    setIsOpen(false);
  };

  const onClose = () => setIsOpen(false);
  
  // Use the provided serviceName or derive it from the service
  const displayName = serviceName || (language === 'ar' ? service.name_ar : service.name_en);
  // Use the provided serviceDescription or derive it from the service
  const displayDescription = serviceDescription || (language === 'ar' ? service.description_ar : service.description_en);
  
  const isRTL = language === 'ar';
  
  return (
    <SheetContent
      side="bottom"
      className="p-0 rounded-t-3xl border-t-0 max-h-[85vh] sm:max-w-full overflow-hidden"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {/* Decorative header element with subtle mint gradient */}
      <div className="absolute inset-x-0 top-0 h-1 bg-mint-50" />
      
      <div className="relative bg-white p-5">
        {/* Main content with description only */}
        <div className="space-y-4">
          <SheetHeader className={`text-${isRTL ? 'right' : 'left'} space-y-2`}>
            <SheetTitle className={`text-xl font-semibold leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
              {displayName}
            </SheetTitle>
          </SheetHeader>

          {displayDescription && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <div className={`text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? 'وصف الخدمة' : 'Description'}
              </div>
              <ScrollArea className="max-h-[160px] pr-4" dir={isRTL ? 'rtl' : 'ltr'}>
                <p className={`text-sm text-gray-600 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                  {displayDescription}
                </p>
              </ScrollArea>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            className="pt-1"
          >
            <button 
              className="w-auto mx-auto block font-medium text-white py-2 px-4 rounded-lg bg-[#C4A484] hover:bg-[#B8997C] transition-all duration-300 text-sm" 
              onClick={handleSelect}
            >
              {isSelected
                ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
                : language === 'ar' ? 'اضف الخدمة' : 'Add Service'}
            </button>
          </motion.div>
        </div>
      </div>
    </SheetContent>
  );
};
