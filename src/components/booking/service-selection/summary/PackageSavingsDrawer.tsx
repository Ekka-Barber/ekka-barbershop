
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";

interface PackageSavingsDrawerProps {
  savings: number;
  language: 'en' | 'ar';
}

export const PackageSavingsDrawer = ({ savings, language }: PackageSavingsDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (savings <= 0) return null;
  
  const isRtl = language === 'ar';
  // Using up/down icons for vertical handle on right edge
  const TriggerIcon = isRtl ? ChevronUp : ChevronDown;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* Compact vertical handle on the right edge - attached flush to the edge */}
      <SheetTrigger asChild>
        <motion.div
          className={`fixed z-50 right-0 top-24
          bg-gradient-to-l from-[#F2FCE2] to-[#E7F7D4] cursor-pointer
          py-1.5 px-1 shadow-md border-y border-l border-green-200 rounded-l-lg
          flex flex-col items-center gap-0.5`}
          whileHover={{ 
            scale: 1.03,
            x: -1
          }}
          layout
        >
          <span className="text-2xs font-medium text-green-700 whitespace-nowrap transform -rotate-90 origin-center">
            {isRtl ? 'وفّرت' : 'Savings'}
          </span>
          <TriggerIcon className="h-2.5 w-2.5 text-green-700" />
        </motion.div>
      </SheetTrigger>
      
      {/* The drawer content with auto height and flush to the edge */}
      <SheetContent 
        side="right"
        className="bg-[#F8FFEE] border-l border-y border-green-200 p-0 rounded-l-xl mx-auto h-auto inset-auto top-24 bottom-auto right-0 shadow-xl"
      >
        <div className="p-3 space-y-2">
          <div className="bg-white rounded-lg p-2.5 shadow-inner">
            <div className="flex flex-col items-center space-y-0.5">
              <span className="text-2xs text-green-700">
                {isRtl ? 'المبلغ الذي وفرته' : 'You saved'}
              </span>
              <PriceDisplay 
                price={savings} 
                language={language} 
                size="lg"
                className="text-green-700 font-bold text-lg"
              />
              <span className="text-[10px] text-green-600 mt-0.5">
                {isRtl 
                  ? 'مقارنة بسعر الخدمات الفردية' 
                  : 'compared to individual prices'}
              </span>
            </div>
          </div>
          
          <div className="text-2xs text-green-700 text-center pb-1">
            <p>
              {isRtl 
                ? 'استمتع بتوفير أكثر عند إضافة خدمات أخرى إلى باقتك!'
                : 'Add more services to save more!'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
