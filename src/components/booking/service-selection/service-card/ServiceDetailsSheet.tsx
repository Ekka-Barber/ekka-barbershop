
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
import { Separator } from "@/components/ui/separator";

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
  
  return (
    <SheetContent
      side="bottom"
      className="p-0 rounded-t-2xl border-t-0 max-h-[85vh] sm:max-w-full bg-white"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {/* Decorative header element */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-green-200 via-green-400 to-green-200 rounded-t-2xl" />
      
      <div className="relative">
        {/* Main content with extra padding and better spacing */}
        <div className="p-7 space-y-6">
          <div className="flex justify-between items-start">
            <SheetHeader className="text-left space-y-2">
              <SheetTitle className="text-xl font-semibold pr-8">
                {displayName}
              </SheetTitle>
              <div className="flex items-center gap-1.5 text-muted-foreground bg-green-50 px-2.5 py-1 rounded-full w-fit">
                <Timer className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">{formatDuration(service.duration, language as 'en' | 'ar')}</span>
              </div>
            </SheetHeader>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-8 w-8 absolute right-6 top-6 hover:bg-gray-100"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-xl p-4"
          >
            <div className="text-sm font-medium mb-2">
              {language === 'ar' ? 'السعر' : 'Price'}
            </div>
            <div className="flex justify-between items-center">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <div className="text-sm font-medium">
                {language === 'ar' ? 'وصف الخدمة' : 'Description'}
              </div>
              <Separator className="bg-gray-100" />
              <ScrollArea className="max-h-[120px] pr-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {displayDescription}
                </p>
              </ScrollArea>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full mt-4 shadow-sm bg-[#C4A484] hover:bg-[#B8997C] transition-all duration-300" 
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
