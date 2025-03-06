
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Tag } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";
import { formatDuration } from "@/utils/formatters";
import { convertToArabic } from "@/utils/arabicNumerals";

interface PackageSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  language: string;
  discountPercentage: number;
  nextTierThreshold?: {
    servicesNeeded: number;
    newPercentage: number;
  };
  totalDuration: number;
}

export const PackageSummary = ({
  originalTotal,
  discountedTotal,
  savings,
  language,
  discountPercentage,
  totalDuration = 0
}: PackageSummaryProps) => {
  const isRTL = language === 'ar';
  
  // Format the discount percentage in Arabic numerals if the language is Arabic
  const formattedDiscountPercentage = isRTL 
    ? `${convertToArabic(discountPercentage.toString())}٪` 
    : `${discountPercentage}%`;
  
  return (
    <div className="space-y-3 pt-2">
      <Separator />
      
      <div className="space-y-2">
        {/* Original Total Row */}
        <div className={cn(
          "flex justify-between text-sm",
          isRTL && "flex-row-reverse"
        )}>
          <PriceDisplay 
            price={originalTotal} 
            language={language as 'en' | 'ar'} 
            size="sm"
          />
          <span className="text-muted-foreground">
            {isRTL ? "المجموع الأصلي" : "Original Total:"}
          </span>
        </div>
        
        {/* Duration Row */}
        <div className={cn(
          "flex justify-between text-sm text-muted-foreground",
          isRTL && "flex-row-reverse"
        )}>
          <span>
            {formatDuration(totalDuration, language as 'en' | 'ar')}
          </span>
          <div className={cn(
            "flex items-center gap-1.5",
            isRTL && "flex-row-reverse"
          )}>
            {isRTL ? "المدة الإجمالية:" : "Total Duration:"}
          </div>
        </div>
        
        {/* Package Discount Row */}
        <div className={cn(
          "flex justify-between text-sm",
          isRTL && "flex-row-reverse"
        )}>
          <span className="text-primary font-medium">
            {formattedDiscountPercentage}
          </span>
          <div className={cn(
            "flex items-center gap-1.5",
            isRTL && "flex-row-reverse"
          )}>
            {isRTL ? (
              <>
                خصم الباقة:
                <Tag className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                <Tag className="h-3.5 w-3.5" />
                Package Discount:
              </>
            )}
          </div>
        </div>
        
        {/* Package Savings Row */}
        {savings > 0 && (
          <motion.div 
            className={cn(
              "flex justify-between text-sm text-green-600",
              isRTL && "flex-row-reverse"
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="flex items-center">
              {isRTL && "-"}
              <PriceDisplay 
                price={savings} 
                language={language as 'en' | 'ar'} 
                size="sm"
                className="text-green-600"
              />
              {!isRTL && "-"}
            </span>
            <span className={cn(
              "flex items-center",
              isRTL && "flex-row-reverse gap-1.5"
            )}>
              {isRTL ? (
                <>
                  توفير الباقة
                  <Package className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <Package className="h-3.5 w-3.5" />
                  Package Savings:
                </>
              )}
            </span>
          </motion.div>
        )}
        
        <Separator className="my-2" />
        
        {/* Final Total Row */}
        <div className={cn(
          "flex justify-between font-medium",
          isRTL && "flex-row-reverse"
        )}>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <PriceDisplay 
              price={discountedTotal} 
              language={language as 'en' | 'ar'} 
              size="base"
              className="font-medium"
            />
          </motion.div>
          <span>
            {isRTL ? "المجموع النهائي" : "Final Total:"}
          </span>
        </div>
      </div>
      
      {/* Savings Message */}
      <AnimatePresence>
        {savings > 0 && (
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
        )}
      </AnimatePresence>
    </div>
  );
};
