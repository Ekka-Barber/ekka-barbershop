
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
          className="fixed bottom-20 right-4 px-3 py-2 rounded-lg bg-[#F2FCE2] border border-green-200 shadow-md max-w-[200px] z-50"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <button 
            onClick={hidePackageSavings}
            className="absolute top-1 right-1 text-green-700/50 hover:text-green-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="flex flex-col items-center text-sm text-green-700 gap-1">
            <div className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5" />
              <span className="font-medium">
                {language === 'ar' ? 'توفير الباقة:' : 'Package savings:'}
              </span>
            </div>
            <div className="flex items-center">
              <PriceDisplay 
                price={savings} 
                language={language} 
                size="sm"
                className="text-green-700 font-bold"
              />
              <ArrowDown className="h-3.5 w-3.5 ml-0.5" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
