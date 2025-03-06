
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";

interface FinalTotalProps {
  price: number;
  language: string;
  isRTL: boolean;
}

/**
 * Animated component that displays the final total price
 * with proper RTL support and motion animations
 */
export const FinalTotal = ({
  price,
  language,
  isRTL
}: FinalTotalProps) => {
  return (
    <div className={cn(
      "flex justify-between font-medium",
      isRTL && "flex-row-reverse"
    )}>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 0.3 }}
      >
        <PriceDisplay 
          price={price} 
          language={language as 'en' | 'ar'} 
          size="base"
          className="font-medium"
        />
      </motion.div>
      <span>
        {isRTL ? "المجموع النهائي" : "Final Total:"}
      </span>
    </div>
  );
};
