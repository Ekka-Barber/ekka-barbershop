
import React from 'react';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface PackageBadgeProps {
  className?: string;
}

export const PackageBadge = ({ className }: PackageBadgeProps) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  
  const getPackageText = () => {
    if (isMobile) {
      return language === 'ar' ? 'اصنع باقتك ✨' : 'Package ✨';
    }
    return language === 'ar' ? 'اصنع باقتك بنفسك ✨' : 'Make your own Package ✨';
  };
  
  return (
    <motion.div 
      className={cn(
        "absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/3 z-10",
        "bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-lg",
        isMobile 
          ? "px-1.5 py-0.5 text-[10px]" 
          : "px-2 py-1 text-xs",
        language === 'ar' ? "flex-row-reverse" : "",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="font-medium flex items-center gap-1">
        <Sparkle className={isMobile ? "w-2.5 h-2.5" : "w-3 h-3"} />
        <span>{getPackageText()}</span>
      </div>
    </motion.div>
  );
};
