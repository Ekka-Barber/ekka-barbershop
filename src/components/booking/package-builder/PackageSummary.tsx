
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { convertToArabic } from "@/utils/arabicNumerals";
import { PriceItem } from "./summary/PriceItem";
import { PackageDiscount } from "./summary/PackageDiscount";
import { PackageSavings } from "./summary/PackageSavings";
import { FinalTotal } from "./summary/FinalTotal";
import { DurationDisplay } from "./summary/DurationDisplay";
import { SavingsAlert } from "./summary/SavingsAlert";

/**
 * Interface for the next tier threshold data expected by PackageSummary
 */
interface NextTierThresholdDisplay {
  itemsUntilNextTier: number;
  nextTierPercentage: number;
}

/**
 * Props for the PackageSummary component
 * @interface PackageSummaryProps
 */
interface PackageSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  language: string;
  discountPercentage: number;
  nextTierThreshold?: NextTierThresholdDisplay;
  totalDuration: number;
}

/**
 * PackageSummary component - displays the pricing details for a package
 * including original price, discount, duration, and savings
 * 
 * @component
 * @example
 * ```tsx
 * <PackageSummary
 *   originalTotal={1000}
 *   discountedTotal={850}
 *   savings={150}
 *   language="en"
 *   discountPercentage={15}
 *   totalDuration={120}
 * />
 * ```
 */
export const PackageSummary = ({
  originalTotal,
  discountedTotal,
  savings,
  language,
  discountPercentage,
  nextTierThreshold,
  totalDuration = 0
}: PackageSummaryProps) => {
  const isRTL = language === 'ar';
  
  const formattedDiscountPercentage = isRTL 
    ? `${convertToArabic(discountPercentage.toString())}٪` 
    : `${discountPercentage}%`;
  
  const packageDiscountLabel = isRTL ? "خصم الخدمات المضافة:" : "Package Discount:";
  
  return (
    <div className="space-y-3 pt-2">
      <Separator />
      
      <div className="space-y-2">
        {/* Original Total */}
        <PriceItem
          label={isRTL ? "المجموع الأصلي" : "Original Total:"}
          price={originalTotal}
          language={language}
          isRTL={isRTL}
        />
        
        {/* Duration */}
        <DurationDisplay
          duration={totalDuration}
          language={language}
          isRTL={isRTL}
        />
        
        {/* Package Discount */}
        <PackageDiscount
          discountPercentage={formattedDiscountPercentage}
          isRTL={isRTL}
          label={packageDiscountLabel}
        />
        
        {/* Package Savings */}
        <PackageSavings
          savings={savings}
          language={language}
          isRTL={isRTL}
        />
        
        <Separator className="my-2" />
        
        {/* Final Total */}
        <FinalTotal
          price={discountedTotal}
          language={language}
          isRTL={isRTL}
        />
      </div>
      
      {/* Savings Alert */}
      <SavingsAlert
        savings={savings}
        language={language}
        isRTL={isRTL}
      />
      
      {/* Next Tier Threshold Alert */}
      {nextTierThreshold && nextTierThreshold.itemsUntilNextTier > 0 && (
        <div className={cn(
          "rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800 flex items-start",
          isRTL && "flex-row-reverse text-right"
        )}>
          <div className={cn("flex items-center", isRTL && "mr-1.5")}>
            <div className={cn("h-3.5 w-3.5 text-amber-600 shrink-0", isRTL ? "ml-1.5" : "mr-1.5")}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </div>
          </div>
          <p className="flex-1">
            {language === 'ar' 
              ? `أضف ${nextTierThreshold.itemsUntilNextTier} خدمة أخرى للحصول على خصم ${nextTierThreshold.nextTierPercentage}%`
              : `Add ${nextTierThreshold.itemsUntilNextTier} more ${nextTierThreshold.itemsUntilNextTier === 1 ? 'service' : 'services'} to get a ${nextTierThreshold.nextTierPercentage}% discount`}
          </p>
        </div>
      )}
    </div>
  );
};
