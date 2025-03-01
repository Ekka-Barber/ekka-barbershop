import * as React from "react";
import { Tag } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { calculateDiscount } from "./calculateDiscount";
import { Language } from "@/types/language";

interface ServiceCardPriceProps {
  price: number;
  discountType?: string;
  discountValue?: number;
  language: Language;
  finalPrice?: number;
  hasDiscount?: boolean;
}

export const ServiceCardPrice = ({
  price,
  discountType,
  discountValue,
  language,
  finalPrice,
  hasDiscount
}: ServiceCardPriceProps) => {
  const discount = hasDiscount !== undefined 
    ? (hasDiscount ? { finalPrice: finalPrice || 0, percentage: Math.round((1 - (finalPrice || 0) / price) * 100) } : null)
    : calculateDiscount(price, discountType, discountValue);
  
  return (
    <div className="text-end mt-1">
      {discount ? (
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1">
            <PriceDisplay 
              price={price} 
              language={language as 'en' | 'ar'} 
              size="sm" 
              className="text-muted-foreground line-through"
            />
            <Tag className="w-3.5 h-3.5 text-destructive" />
            <span className="text-xs text-destructive">-{discount.percentage}%</span>
          </div>
          <PriceDisplay 
            price={discount.finalPrice} 
            language={language as 'en' | 'ar'} 
            size="sm"
          />
        </div>
      ) : (
        <PriceDisplay 
          price={price} 
          language={language as 'en' | 'ar'} 
          size="sm"
        />
      )}
    </div>
  );
};
