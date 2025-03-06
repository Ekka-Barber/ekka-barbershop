
import React from 'react';
import { Service } from '@/types/service';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckCircle, PlusCircle, Timer } from "lucide-react";
import { formatNumber } from "@/utils/priceFormatting";
import { formatDuration } from "@/utils/formatters";
import { motion, AnimatePresence } from 'framer-motion';

interface PackageServiceListProps {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  discountPercentage: number;
  language: string;
}

export const PackageServiceList = ({
  services,
  selectedServices,
  onToggleService,
  discountPercentage,
  language
}: PackageServiceListProps) => {
  if (services.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {language === 'ar' ? 'لا توجد خدمات متاحة للباقة' : 'No services available for package'}
      </div>
    );
  }
  
  const calculateDiscountedPrice = (price: number) => {
    return Math.floor(price * (1 - discountPercentage / 100));
  };
  
  // Sort services by their display_order if they have that property
  const sortedServices = [...services].sort((a: any, b: any) => {
    // If both services have display_order property, sort by it
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    // If only one has display_order, prioritize it
    if (a.display_order !== undefined) return -1;
    if (b.display_order !== undefined) return 1;
    // Fall back to name
    return (language === 'ar' ? 
      a.name_ar.localeCompare(b.name_ar) : 
      a.name_en.localeCompare(b.name_en));
  });
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center justify-between">
        <span>
          {language === 'ar' ? 'الخدمات الإضافية' : 'Add-on Services'}
        </span>
        {discountPercentage > 0 && (
          <span className="text-green-600 text-xs px-2 py-0.5 bg-green-50 rounded-full">
            {discountPercentage}% {language === 'ar' ? 'خصم' : 'off'}
          </span>
        )}
      </h3>
      
      <ScrollArea className="h-48 rounded-md border">
        <div className="px-3 py-2">
          <AnimatePresence>
            {sortedServices.map((service) => {
              const isSelected = selectedServices.some(s => s.id === service.id);
              const discountedPrice = calculateDiscountedPrice(service.price);
              
              return (
                <motion.button 
                  key={service.id} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md w-full transition-all duration-200 mb-2 relative",
                    isSelected 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted/70 border border-transparent"
                  )}
                  onClick={() => onToggleService(service)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  initial={isSelected ? { backgroundColor: "rgba(153, 135, 245, 0.3)" } : {}}
                  animate={isSelected ? { backgroundColor: "rgba(153, 135, 245, 0.1)" } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {/* Selection indicator */}
                  <div className={cn(
                    "absolute -top-1.5 -right-1.5",
                    language === 'ar' && "-top-1.5 -left-1.5 right-auto"
                  )}>
                    <AnimatePresence mode="wait">
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="h-4 w-4 text-[#9b87f5]" />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <PlusCircle className="h-4 w-4 text-muted-foreground" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Price display */}
                  <div className={cn(
                    "whitespace-nowrap",
                    language === 'ar' ? "text-right" : "text-left"
                  )}>
                    <AnimatePresence mode="wait">
                      {isSelected && discountPercentage > 0 ? (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className={cn(
                            "flex flex-col",
                            language === 'ar' ? "items-end" : "items-start"
                          )}
                        >
                          <span className="line-through text-muted-foreground text-xs">
                            {formatNumber(service.price, language as 'en' | 'ar')}
                          </span>
                          <span className="text-green-600 font-medium">
                            {formatNumber(discountedPrice, language as 'en' | 'ar')}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={isSelected ? "font-medium" : ""}
                        >
                          {formatNumber(service.price, language as 'en' | 'ar')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  {/* Service name and duration */}
                  <div className={cn(
                    "flex items-center gap-3 flex-1 min-w-0",
                    language === 'ar' ? "flex-row-reverse text-right" : "flex-row text-left"
                  )}>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-tight truncate">
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </span>
                      {service.duration > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          {formatDuration(service.duration, language as 'en' | 'ar')}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
};
