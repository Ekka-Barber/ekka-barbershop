
import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { cn } from "@/lib/utils";

interface PackageBuilderHeaderProps {
  language: string;
}

export const PackageBuilderHeader = ({ language }: PackageBuilderHeaderProps) => {
  const isRTL = language === 'ar';
  
  return (
    <div className={cn(
      "flex items-center gap-2 mb-1",
      isRTL && "flex-row-reverse"
    )}>
      <motion.div
        initial={{ rotate: -10, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ duration: 0.3, type: 'spring' }}
      >
        <Package className="h-5 w-5 text-primary" />
      </motion.div>
      <motion.h2 
        className="text-xl font-semibold text-gray-800"
        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isRTL ? 'بناء باقة خدماتك' : 'Build Your Service Package'}
      </motion.h2>
    </div>
  );
};
