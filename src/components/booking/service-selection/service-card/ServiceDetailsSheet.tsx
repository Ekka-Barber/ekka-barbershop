
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
      className="p-0 rounded-t-3xl border-t-0 max-h-[85vh] sm:max-w-full bg-white overflow-hidden"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      {/* Decorative header element with gradient */}
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-green-300 via-green-400 to-green-300 rounded-t-3xl" />
      
      <div className="relative">
        {/* Main content with improved spacing and gradients */}
        <div className="px-7 pt-8 pb-8 space-y-7">
          <div className="flex justify-between items-start">
            <SheetHeader className="text-left space-y-3">
              <SheetTitle className="text-2xl font-semibold pr-10 leading-tight">
                {displayName}
              </SheetTitle>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-1.5 text-muted-foreground bg-green-50 px-3 py-1.5 rounded-full w-fit"
              >
                <Timer className="h-4 w-4 text-green-600" />
                <span className="text-green-700 font-medium">{formatDuration(service.duration, language as 'en' | 'ar')}</span>
              </motion.div>
            </SheetHeader>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full h-10 w-10 absolute right-5 top-4 hover:bg-gray-100 transition-all duration-200"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-green-50 via-green-50 to-emerald-50 rounded-2xl p-5 shadow-sm"
          >
            <div className="text-sm font-medium mb-2 text-green-800">
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
              <div className="text-sm font-medium text-gray-700">
                {language === 'ar' ? 'وصف الخدمة' : 'Description'}
              </div>
              <Separator className="bg-gray-100" />
              <ScrollArea className="max-h-[150px] pr-4">
                <p className="text-sm text-gray-600 leading-relaxed">
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
            className="pt-2"
          >
            <Button 
              className="w-full font-medium text-white py-6 rounded-xl shadow-md bg-gradient-to-r from-[#B8997C] via-[#C4A484] to-[#B8997C] hover:opacity-90 transition-all duration-300" 
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
