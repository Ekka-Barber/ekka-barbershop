
import React from 'react';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface PackageBadgeProps {
  className?: string;
}

export const PackageBadge = ({ className }: PackageBadgeProps) => {
  const { language } = useLanguage();
  
  return (
    <motion.div 
      className={cn(
        "absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/3 z-10",
        "bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-white",
        "rounded-full px-2 py-1 text-xs font-bold flex items-center gap-1",
        "shadow-[0_2px_10px_rgba(255,180,0,0.5)] border border-white/20",
        language === 'ar' ? "flex-row-reverse" : "",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
    >
      <Sparkle className="w-4 h-4 text-yellow-100" />
      <span>
        {language === 'ar' 
          ? 'اصنع باقتك بنفسك ✨' 
          : 'Make your own Package ✨'}
      </span>
    </motion.div>
  );
};
