
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, ArrowDown, X } from 'lucide-react';
import { PriceDisplay } from "@/components/ui/price-display";

interface PackageSavingsProps {
  savings: number;
  language: 'en' | 'ar';
}

export const PackageSavings = ({ savings, language }: PackageSavingsProps) => {
  const [isVisible, setIsVisible] = React.useState(true);
  
  if (savings <= 0) return null;
  
  const hidePackageSavings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsVisible(false);
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed top-32 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-[#F2FCE2] border border-green-200 shadow-md z-50 flex items-center gap-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-1.5">
            <Tag className="h-4 w-4 text-green-700" />
            <span className="text-sm font-medium text-green-700">
              {language === 'ar' ? 'توفير الباقة:' : 'Package savings:'}
            </span>
            <PriceDisplay 
              price={savings} 
              language={language} 
              size="sm"
              className="text-green-700 font-bold"
            />
            <ArrowDown className="h-4 w-4 text-green-700" />
          </div>
          <button 
            onClick={hidePackageSavings}
            className="text-green-700/50 hover:text-green-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
