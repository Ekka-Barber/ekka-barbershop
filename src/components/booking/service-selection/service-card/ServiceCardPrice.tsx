
import * as React from "react";
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
  // Calculate discount properly based on the inputs
  const discount = React.useMemo(() => {
    if (hasDiscount !== undefined) {
      return hasDiscount ? { finalPrice: finalPrice || 0, percentage: Math.round((1 - (finalPrice || 0) / price) * 100) } : null;
    }
    return calculateDiscount(price, discountType, discountValue);
  }, [price, discountType, discountValue, hasDiscount, finalPrice]);
  
  return (
    <div className="text-end mt-1">
      {discount ? (
        <div className="flex flex-col items-end">
          <PriceDisplay 
            price={price} 
            language={language as 'en' | 'ar'} 
            size="sm" 
            className="text-[#ea384c] line-through"
          />
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
