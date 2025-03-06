
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PriceDisplay } from "@/components/ui/price-display";

interface SavingsAlertProps {
  savings: number;
  language: string;
  isRTL: boolean;
}

/**
 * Animated alert component that highlights package savings
 * with proper RTL support and appear/disappear animations
 */
export const SavingsAlert = ({
  savings,
  language,
  isRTL
}: SavingsAlertProps) => {
  if (savings <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="bg-green-50 border border-green-100 rounded-md p-2 text-sm text-center text-green-700"
      >
        {isRTL 
          ? 'مجموع ما ستوفره (' 
          : "You'll save "}
        <PriceDisplay 
          price={savings} 
          language={language as 'en' | 'ar'} 
          size="sm"
          className="text-green-700 font-medium inline-flex"
        />
        {isRTL 
          ? ') مع هذه الباقة 😍' 
          : ' with this package!'}
      </motion.div>
    </AnimatePresence>
  );
};
