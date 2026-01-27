
import React from "react";

import { cn } from "@shared/lib/utils";
import RiyalIcon from "@shared/ui/components/icons/RiyalIcon";
import { convertToArabic } from "@shared/utils/arabicNumerals";

interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  showDiscount?: boolean;
  language: 'en' | 'ar';
  size?: 'sm' | 'base' | 'lg';
  className?: string;
}

export const PriceDisplay = ({ 
  price, 
  originalPrice,
  showDiscount = false,
  language,
  size = 'base',
  className 
}: PriceDisplayProps) => {
  const formatNumber = (num: number): string => {
    const rounded = Math.round(num);
    return language === 'ar' ? convertToArabic(rounded.toString()) : rounded.toString();
  };

  const sizeClasses = {
    sm: "text-sm",
    base: "text-base",
    lg: "text-lg"
  };

  const iconClasses = cn(
    size === 'sm' && "w-3.5 h-3.5",
    size === 'base' && "w-4 h-4",
    size === 'lg' && "w-5 h-5"
  );

  return (
    <div 
      className={cn(
        "flex items-center gap-1",
        language === 'ar' ? "flex-row-reverse" : "flex-row",
        sizeClasses[size],
        className
      )}
    >
      <RiyalIcon className={iconClasses} />
      <span>{formatNumber(price)}</span>
      {showDiscount && originalPrice && originalPrice > price && (
        <span className={cn(
          "text-muted-foreground line-through text-sm",
          language === 'ar' ? "mr-2" : "ml-2",
          "flex items-center gap-1",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <RiyalIcon className="w-3.5 h-3.5" />
          <span>{formatNumber(originalPrice)}</span>
        </span>
      )}
    </div>
  );
};
