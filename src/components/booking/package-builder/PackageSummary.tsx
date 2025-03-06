
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
        <div className="flex justify-between text-sm">
          <span className={cn("text-muted-foreground", isRTL && "order-last")}>
            {isRTL ? 'المجموع الأصلي:' : 'Original Total:'}
          </span>
          <PriceDisplay 
            price={originalTotal} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className={isRTL && "order-first"}
          />
        </div>
        
        {savings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className={cn("flex items-center", isRTL && "order-last flex-row-reverse")}>
              <Package className={cn("h-3.5 w-3.5", isRTL ? "ml-1.5" : "mr-1.5")} />
              {isRTL ? 'توفير الباقة:' : 'Package Savings:'}
            </span>
            <span className={cn("flex items-center", isRTL && "order-first")}>
              {isRTL && '-'} 
              <PriceDisplay 
                price={savings} 
                language={language as 'en' | 'ar'} 
                size="sm"
                className="text-green-600"
              />
              {!isRTL && '-'}
            </span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-medium">
          <span className={isRTL && "order-last"}>
            {isRTL ? 'المجموع النهائي:' : 'Final Total:'}
          </span>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            className={isRTL && "order-first"}
          >
            <PriceDisplay 
              price={discountedTotal} 
              language={language as 'en' | 'ar'} 
              size="base"
              className="font-medium"
            />
          </motion.div>
        </div>
      </div>
      
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
