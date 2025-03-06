
import React from 'react';
import { Service } from '@/types/service';
import { PriceDisplay } from "@/components/ui/price-display";
import { Timer, Scissors } from "lucide-react";
import { formatDuration } from "@/utils/formatters";
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

interface BaseServiceDisplayProps {
  baseService: Service | null;
  language: string;
}

export const BaseServiceDisplay = ({ baseService, language }: BaseServiceDisplayProps) => {
  if (!baseService) return null;
  
  const isRTL = language === 'ar';
  
  return (
    <motion.div 
      className="bg-primary/5 p-3 rounded-md border border-primary/20"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex justify-between items-center gap-2 mb-1",
        isRTL && "flex-row-reverse"
      )}>
        <div className="flex items-center gap-1.5">
          <Scissors className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {isRTL ? 'الخدمة الأساسية:' : 'Base Service:'}
          </span>
        </div>
        <div className="text-xs px-2 py-0.5 bg-primary/10 rounded-full text-primary">
          {isRTL ? 'أساسي' : 'BASE'}
        </div>
      </div>
      
      <div className={cn(
        "flex justify-between items-center",
        isRTL && "flex-row-reverse"
      )}>
        <div className="flex flex-col">
          <PriceDisplay 
            price={baseService.price} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className="font-medium"
          />
          
          {baseService.duration > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Timer className="h-3 w-3" />
              {formatDuration(baseService.duration, language as 'en' | 'ar')}
            </span>
          )}
        </div>
        
        <span className="font-medium">
          {isRTL ? baseService.name_ar : baseService.name_en}
        </span>
      </div>
    </motion.div>
  );
};
