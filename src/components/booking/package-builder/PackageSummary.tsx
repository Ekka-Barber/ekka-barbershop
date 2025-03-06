
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
        <div className="flex justify-between text-sm">
          {isRTL ? (
            <>
              <PriceDisplay 
                price={originalTotal} 
                language={language as 'en' | 'ar'} 
                size="sm"
              />
              <span className="text-muted-foreground">
                المجموع الأصلي
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground">
                Original Total:
              </span>
              <PriceDisplay 
                price={originalTotal} 
                language={language as 'en' | 'ar'} 
                size="sm"
              />
            </>
          )}
        </div>
        
        {/* Package Savings Row */}
        {savings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            {isRTL ? (
              <>
                <span className="flex items-center">
                  {'-'} 
                  <PriceDisplay 
                    price={savings} 
                    language={language as 'en' | 'ar'} 
                    size="sm"
                    className="text-green-600"
                  />
                </span>
                <span className="flex items-center gap-1.5">
                  توفير الباقة
                  <Package className="h-3.5 w-3.5" />
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Package Savings:
                </span>
                <span className="flex items-center">
                  <PriceDisplay 
                    price={savings} 
                    language={language as 'en' | 'ar'} 
                    size="sm"
                    className="text-green-600"
                  />
                  {'-'}
                </span>
              </>
            )}
          </div>
        )}
        
        <Separator className="my-2" />
        
        {/* Final Total Row */}
        <div className="flex justify-between font-medium">
          {isRTL ? (
            <>
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
                المجموع النهائي
              </span>
            </>
          ) : (
            <>
              <span>
                Final Total:
              </span>
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
            </>
          )}
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
