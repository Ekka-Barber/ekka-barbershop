
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
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
      {/* More compact vertical handle on the right edge */}
      <SheetTrigger asChild>
        <motion.div
          className={`fixed z-50 right-0 top-24
          bg-gradient-to-l from-[#F2FCE2] to-[#E7F7D4] cursor-pointer
          py-2 px-2 shadow-md border border-green-200 rounded-l-lg
          flex flex-col items-center gap-1`}
          whileHover={{ 
            scale: 1.05,
            x: -2
          }}
          layout
        >
          <span className="text-xs font-medium text-green-700 whitespace-nowrap transform -rotate-90 origin-center">
            {isRtl ? 'وفّرت' : 'Savings'}
          </span>
          <TriggerIcon className="h-3 w-3 text-green-700" />
        </motion.div>
      </SheetTrigger>
      
      {/* The drawer content - coming from right side */}
      <SheetContent 
        side="right"
        className="bg-[#F8FFEE] border-green-200 p-0 rounded-l-xl mx-auto max-w-md"
      >
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Tag className="h-4 w-4 text-green-700" />
            <h3 className="text-base font-semibold text-green-700">
              {isRtl ? 'توفيرات الباقة' : 'Package Savings'}
            </h3>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-inner">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs text-green-700">
                {isRtl ? 'المبلغ الذي وفرته' : 'You saved'}
              </span>
              <PriceDisplay 
                price={savings} 
                language={language} 
                size="lg"
                className="text-green-700 font-bold text-xl"
              />
              <span className="text-2xs text-green-600 mt-1">
                {isRtl 
                  ? 'مقارنة بسعر الخدمات الفردية' 
                  : 'compared to individual service prices'}
              </span>
            </div>
          </div>
          
          <div className="text-xs text-green-700 text-center">
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
