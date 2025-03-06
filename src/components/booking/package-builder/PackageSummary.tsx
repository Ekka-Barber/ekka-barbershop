
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
 * Interface for the next tier threshold data
 * @interface NextTierThreshold
 */
interface NextTierThreshold {
  servicesNeeded: number;
  newPercentage: number;
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
  nextTierThreshold?: NextTierThreshold;
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
    </div>
  );
};
