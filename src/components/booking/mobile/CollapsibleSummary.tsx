
import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SelectedService } from "@/types/service";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";

interface CollapsibleSummaryProps {
  selectedServices: SelectedService[];
  totalPrice: number;
  totalDuration: number;
}

export const CollapsibleSummary = ({
  selectedServices,
  totalPrice,
  totalDuration
}: CollapsibleSummaryProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { language } = useLanguage();
  
  const toggleOpen = () => setIsOpen(prev => !prev);
  
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-40 bg-background shadow-lg border-t border-border/30"
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
    >
      <div className="w-full max-w-md mx-auto">
        <button 
          onClick={toggleOpen}
          className="flex items-center justify-between w-full p-4 text-left focus:outline-none"
        >
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {language === 'ar' ? 'الخدمات المحددة' : 'Selected Services'}
              </span>
              <span className="font-medium">
                {selectedServices.length > 0 
                  ? language === 'ar' 
                    ? `${selectedServices.length} خدمات` 
                    : `${selectedServices.length} services`
                  : language === 'ar' 
                    ? 'لا توجد خدمات' 
                    : 'No services'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {language === 'ar' ? 'المجموع' : 'Total'}
              </span>
              <div className="font-medium">
                <PriceDisplay 
                  price={totalPrice} 
                  language={language as 'en' | 'ar'} 
                />
              </div>
            </div>
            
            <div className={cn(
              "transition-transform duration-300",
              isOpen ? "rotate-180" : ""
            )}>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border-t border-border/30"
            >
              <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                {selectedServices.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedServices.map((service) => (
                      <motion.li 
                        key={service.id}
                        className="flex justify-between items-center text-sm"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
                        <PriceDisplay 
                          price={service.price} 
                          originalPrice={service.originalPrice}
                          showDiscount={true}
                          language={language as 'en' | 'ar'} 
                          size="sm"
                        />
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center text-muted-foreground py-3">
                    {language === 'ar' 
                      ? 'لم يتم اختيار أي خدمات بعد' 
                      : 'No services selected yet'}
                  </div>
                )}
                
                <div className="pt-2 border-t flex justify-between text-sm text-muted-foreground">
                  <span>{language === 'ar' ? 'المدة' : 'Duration'}</span>
                  <span>
                    {totalDuration} {language === 'ar' ? 'د' : 'mins'}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
