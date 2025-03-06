
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
  // Changed icons to Up/Down for 90-degree rotated handle
  const TriggerIcon = isRtl ? ChevronDown : ChevronUp;
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      {/* The "tongue" handle that sticks out from the edge - now at the bottom */}
      <SheetTrigger asChild>
        <motion.div
          className={`fixed z-50 bottom-0 left-1/2 -translate-x-1/2
          bg-gradient-to-t from-[#F2FCE2] to-[#E7F7D4] cursor-pointer
          px-5 py-2 shadow-md border border-green-200 rounded-t-xl
          flex flex-col items-center gap-1`}
          whileHover={{ 
            scale: 1.03,
            y: -2
          }}
          layout
        >
          <TriggerIcon className="h-4 w-4 text-green-700" />
          <span className="text-sm font-medium text-green-700 whitespace-nowrap">
            {isRtl ? 'تدري كم وفّرت ؟' : 'Your savings'}
          </span>
        </motion.div>
      </SheetTrigger>
      
      {/* The drawer content - now coming from bottom and sized to fit content */}
      <SheetContent 
        side="bottom"
        className="bg-[#F8FFEE] border-green-200 p-0 rounded-t-xl mx-auto max-w-md"
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
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
          
          <div className="text-sm text-green-700 text-center">
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
