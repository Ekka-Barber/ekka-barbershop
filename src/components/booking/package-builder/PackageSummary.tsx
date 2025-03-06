
import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";

interface PackageSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  language: string;
}

export const PackageSummary = ({
  originalTotal,
  discountedTotal,
  savings,
  language
}: PackageSummaryProps) => {
  const isRTL = language === 'ar';
  
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
        
        {/* Package Savings Row */}
        {savings > 0 && (
          <div className={cn(
            "flex justify-between text-sm text-green-600",
            isRTL && "flex-row-reverse"
          )}>
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
          </div>
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
      {savings > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-md p-2 text-sm text-center text-green-700">
          {isRTL 
            ? 'ستوفر ' 
            : "You'll save "}
          <PriceDisplay 
            price={savings} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className="text-green-700 font-medium inline-flex"
          />
          {isRTL 
            ? ' مع هذه الباقة!' 
            : ' with this package!'}
        </div>
      )}
    </div>
  );
};
