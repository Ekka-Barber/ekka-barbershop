
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";
import { Package } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";

interface PackageSavingsProps {
  savings: number;
  language: string;
  isRTL: boolean;
}

/**
 * Animated component that displays the total savings from the package
 * with proper RTL support and motion animations
 */
export const PackageSavings = ({
  savings,
  language,
  isRTL
}: PackageSavingsProps) => {
  if (savings <= 0) return null;

  return (
    <motion.div 
      className={cn(
        "flex justify-between text-sm text-green-600",
        isRTL && "flex-row-reverse"
      )}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="flex items-center">
        {isRTL && "-"}
        <PriceDisplay 
          price={savings} 
          language={language as 'en' | 'ar'} 
          size="sm"
          className="text-green-600"
        />
        {!isRTL && "-"}
      </span>
      <span className={cn(
        "flex items-center",
        isRTL && "flex-row-reverse gap-1.5"
      )}>
        {isRTL ? (
          <>
            توفير الباقة
            <Package className="h-3.5 w-3.5" />
          </>
        ) : (
          <>
            <Package className="h-3.5 w-3.5" />
            Package Savings:
          </>
        )}
      </span>
    </motion.div>
  );
};
