
import React from "react";
import { cn } from "@/lib/utils";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { convertToArabic } from "@/utils/arabicNumerals";

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
    lg: "text-xl font-semibold"
  };

  const iconClasses = cn(
    size === 'sm' && "w-3.5 h-3.5",
    size === 'base' && "w-4 h-4",
    size === 'lg' && "w-5 h-5"
  );

  return (
    <div 
      className={cn(
        "flex items-center gap-1.5",
        language === 'ar' ? "flex-row-reverse" : "flex-row",
        sizeClasses[size],
        className
      )}
    >
      <RiyalIcon className={cn(iconClasses, "text-green-700")} />
      <span>{formatNumber(price)}</span>
      {showDiscount && originalPrice && originalPrice > price && (
        <span className={cn(
          "text-muted-foreground line-through text-sm",
          language === 'ar' ? "mr-3" : "ml-3",
          "flex items-center gap-1",
          language === 'ar' ? "flex-row-reverse" : "flex-row"
        )}>
          <RiyalIcon className="w-3.5 h-3.5 opacity-70" />
          <span>{formatNumber(originalPrice)}</span>
        </span>
      )}
    </div>
  );
};
