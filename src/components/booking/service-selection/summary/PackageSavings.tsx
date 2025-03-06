
import React from 'react';
import { motion } from 'framer-motion';
import { Tag, ArrowDown } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";

interface PackageSavingsProps {
  savings: number;
  language: 'en' | 'ar';
}

export const PackageSavings = ({ savings, language }: PackageSavingsProps) => {
  if (savings <= 0) return null;
  
  return (
    <motion.div 
      className="w-full bg-[#F2FCE2] py-1 border-t border-green-200 z-10 relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex items-center justify-center text-sm text-green-700 gap-1">
        <Tag className="h-3.5 w-3.5" />
        <span className="font-medium">
          {language === 'ar' ? 'توفير الباقة:' : 'Package savings:'}
        </span>
        <PriceDisplay 
          price={savings} 
          language={language} 
          size="sm"
          className="text-green-700 font-medium"
        />
        <ArrowDown className="h-3.5 w-3.5 ml-0.5" />
      </div>
    </motion.div>
  );
};
