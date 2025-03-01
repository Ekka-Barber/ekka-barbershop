
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Slash, X, Timer, Calendar, User, Check } from "lucide-react";
import { SelectedService } from "@/types/service";
import { PriceDisplay } from "@/components/ui/price-display";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface BookingSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  selectedDate?: Date;
  selectedTime?: string;
  selectedBarberName?: string;
  onRemoveService?: (serviceId: string) => void;
}

const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};

export const BookingSummary = ({
  selectedServices,
  totalPrice,
  selectedDate,
  selectedTime,
  selectedBarberName,
  onRemoveService
}: BookingSummaryProps) => {
  const { t, language } = useLanguage();
  const [isSticky, setIsSticky] = useState(false);
  
  const totalDuration = selectedServices.reduce((total, service) => total + (service.duration || 0), 0);
  const totalOriginalPrice = selectedServices.reduce((sum, service) => sum + (service.originalPrice || service.price), 0);
  const totalDiscount = totalOriginalPrice - totalPrice;

  // Effect for setting stickiness on scroll (desktop only)
  useEffect(() => {
    const checkScroll = () => {
      const scrollY = window.scrollY;
      // Only apply stickiness on desktop
      if (window.innerWidth >= 768) {
        setIsSticky(scrollY > 100);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const serviceItem = (service: SelectedService) => (
    <motion.div 
      key={service.id} 
      className="flex justify-between items-center py-2 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
        {onRemoveService && service.isUpsellItem && (
          <motion.button
            onClick={() => onRemoveService(service.id)}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Remove service"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-red-500" />
          </motion.button>
        )}
        {service.isUpsellItem && (
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs text-green-600">
            <Check className="w-3 h-3 mr-0.5" />
            {language === 'ar' ? 'عرض' : 'Offer'}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {service.originalPrice && service.originalPrice > service.price && (
          <PriceDisplay 
            price={service.originalPrice} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className="text-[#ea384c] line-through"
          />
        )}
        <PriceDisplay 
          price={service.price} 
          language={language as 'en' | 'ar'} 
          size="sm"
        />
      </div>
    </motion.div>
  );

  return (
    <motion.div 
      className={cn(
        "rounded-lg border p-4 space-y-3 bg-background",
        isSticky && "md:sticky md:top-4 md:transition-all md:duration-300"
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="font-medium">{language === 'ar' ? 'ملخص الحجز' : t('booking.summary')}</h3>
      
      <div className="space-y-2 text-sm divide-y">
        <div className="pb-2">
          <AnimatePresence>
            {selectedServices.length > 0 ? (
              selectedServices.map(service => serviceItem(service))
            ) : (
              <motion.div 
                className="text-muted-foreground text-center py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {language === 'ar' ? 'لم يتم اختيار أي خدمات' : 'No services selected'}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {totalDuration > 0 && (
          <div className="pt-2 flex justify-between text-muted-foreground items-center">
            <span className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              {language === 'ar' ? 'المدة الإجمالية' : t('total.duration')}
            </span>
            <motion.span
              key={totalDuration}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {totalDuration} {language === 'ar' 
                ? 'د'
                : t('minutes')}
            </motion.span>
          </div>
        )}
        
        {selectedDate && selectedTime && (
          <div className="pt-2 flex justify-between text-muted-foreground items-center">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {language === 'ar' ? 'التاريخ والوقت' : t('date.time')}
            </span>
            <span>{format(selectedDate, 'dd/MM/yyyy')} - {selectedTime}</span>
          </div>
        )}

        {selectedBarberName && (
          <div className="pt-2 flex justify-between text-muted-foreground items-center">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {language === 'ar' ? 'الحلاق' : t('barber')}
            </span>
            <span>{selectedBarberName}</span>
          </div>
        )}

        {totalDiscount > 0 && (
          <motion.div 
            className="pt-2 flex justify-between items-center"
            initial={{ backgroundColor: "rgba(254, 226, 226, 0.3)" }}
            animate={{ backgroundColor: "transparent" }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center gap-2 text-[#ea384c]">
              <Slash className="w-4 h-4" />
              <span>{language === 'ar' ? 'الخصم' : t('discount')}</span>
            </div>
            <PriceDisplay 
              price={totalDiscount} 
              language={language as 'en' | 'ar'}
              size="sm"
              className="text-[#ea384c]"
            />
          </motion.div>
        )}
        
        <div className="border-t pt-3 font-medium flex justify-between">
          <span>{language === 'ar' ? 'المجموع' : t('total')}</span>
          <motion.div
            key={totalPrice}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <PriceDisplay 
              price={totalPrice} 
              language={language as 'en' | 'ar'}
              size="base"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
