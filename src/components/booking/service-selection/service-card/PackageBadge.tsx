
import React from 'react';
import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PackageBadgeProps {
  className?: string;
}

export const PackageBadge = ({ className }: PackageBadgeProps) => {
  return (
    <motion.div 
      className={cn(
        "absolute -top-2 -right-2 bg-[#C4A484] text-white rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1 shadow-md",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Package className="w-3 h-3" />
      <span>Package</span>
    </motion.div>
  );
};
