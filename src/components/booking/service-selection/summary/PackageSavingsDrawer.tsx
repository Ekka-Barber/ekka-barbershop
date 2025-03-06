
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";
import { 
  Sheet,
  SheetContent,
  SheetTrigger
} from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

interface PackageSavingsDrawerProps {
  savings: number;
  language: 'en' | 'ar';
}

export const PackageSavingsDrawer = ({ savings, language }: PackageSavingsDrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (savings <= 0) return null;
  
  const isRtl = language === 'ar';
  const TriggerIcon = isRtl ? ChevronLeft : ChevronRight;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* The "tongue" handle that sticks out from the edge */}
      <SheetTrigger asChild>
        <motion.div
          className={`fixed z-50 top-1/2 -translate-y-1/2 ${isRtl ? 'left-0 rounded-r-xl' : 'right-0 rounded-l-xl'} 
          bg-gradient-to-l from-[#F2FCE2] to-[#E7F7D4] cursor-pointer
          py-3 px-4 shadow-md border border-green-200
          flex items-center gap-2`}
          whileHover={{ 
            scale: 1.03,
            x: isRtl ? 3 : -3
          }}
          layout
        >
          <span className="text-sm font-medium text-green-700 whitespace-nowrap">
            {isRtl ? 'تدري كم وفّرت ؟' : 'Your savings'}
          </span>
          <TriggerIcon className="h-4 w-4 text-green-700" />
        </motion.div>
      </SheetTrigger>
      
      {/* The drawer content */}
      <SheetContent 
        side={isRtl ? "left" : "right"} 
        className="bg-[#F8FFEE] border-green-200 p-0 w-80 max-w-[80vw]"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-green-700" />
            <h3 className="text-lg font-semibold text-green-700">
              {isRtl ? 'توفيرات الباقة' : 'Package Savings'}
            </h3>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-inner">
            <div className="flex flex-col items-center space-y-2">
              <span className="text-sm text-green-700">
                {isRtl ? 'المبلغ الذي وفرته' : 'You saved'}
              </span>
              <PriceDisplay 
                price={savings} 
                language={language} 
                size="lg"
                className="text-green-700 font-bold text-2xl"
              />
              <span className="text-xs text-green-600 mt-2">
                {isRtl 
                  ? 'مقارنة بسعر الخدمات الفردية' 
                  : 'compared to individual service prices'}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-green-700 mt-6">
            <p>
              {isRtl 
                ? 'استمتع بتوفير أكثر عند إضافة خدمات أخرى إلى باقتك!'
                : 'Enjoy more savings by adding more services to your package!'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
