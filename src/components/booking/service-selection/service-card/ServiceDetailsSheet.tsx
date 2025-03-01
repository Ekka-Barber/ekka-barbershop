
import * as React from "react";
import { Timer, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ServiceCardPrice } from "./ServiceCardPrice";
import { formatDuration } from "@/utils/formatters";
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
      
      <div className="relative bg-white">
        {/* Main content with improved spacing */}
        <div className="px-5 pt-6 pb-5 space-y-5">
          <div className="flex justify-between items-start">
            <SheetHeader className={`text-${isRTL ? 'right' : 'left'} space-y-2`}>
              <SheetTitle className={`text-xl font-semibold pr-8 leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                {displayName}
              </SheetTitle>
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`flex items-center gap-1.5 text-muted-foreground bg-mint-50 px-3 py-1.5 rounded-full w-fit ${isRTL ? 'mr-0 ml-auto' : ''}`}
              >
                <Timer className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700 font-medium">{formatDuration(service.duration, language as 'en' | 'ar')}</span>
              </motion.div>
            </SheetHeader>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-8 w-8 absolute right-4 top-4 hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-mint-50 rounded-xl p-4"
          >
            <div className={`text-sm font-medium mb-1 text-emerald-800 ${isRTL ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? 'السعر' : 'Price'}
            </div>
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} items-center`}>
              {finalPrice !== undefined && hasDiscount !== undefined ? (
                <ServiceCardPrice
                  price={service.price}
                  finalPrice={finalPrice}
                  hasDiscount={hasDiscount}
                  language={language}
                  size="lg"
                />
              ) : (
                <ServiceCardPrice
                  price={service.price}
                  discountType={service.discount_type}
                  discountValue={service.discount_value}
                  language={language}
                  size="lg"
                />
              )}
            </div>
          </motion.div>

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
              <ScrollArea className="max-h-[80px] pr-4" dir={isRTL ? 'rtl' : 'ltr'}>
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
            <Button 
              className="w-full font-medium text-white py-5 rounded-xl bg-[#C4A484] hover:bg-[#B8997C] transition-all duration-300" 
              onClick={handleSelect}
            >
              {isSelected
                ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
                : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
            </Button>
          </motion.div>
        </div>
      </div>
    </SheetContent>
  );
};
