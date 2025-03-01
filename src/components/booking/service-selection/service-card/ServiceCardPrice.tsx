
import * as React from "react";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";

interface ServiceCardPriceProps {
  price: number;
  finalPrice: number;
  hasDiscount: boolean;
  language: string;
}

export const ServiceCardPrice = ({ 
  price, 
  finalPrice, 
  hasDiscount, 
  language 
}: ServiceCardPriceProps) => {
  return (
    <div className="space-y-1 text-right">
      {hasDiscount && (
        <PriceDisplay 
          price={price}
          language={language}
          showDiscount={true}
          className="text-sm text-muted-foreground decoration-[#ea384c] line-through"
        />
      )}
      <PriceDisplay 
        price={finalPrice}
        language={language}
        className={cn(
          "font-semibold",
          hasDiscount && "text-[#ea384c]"
        )}
      />
    </div>
  );
};
