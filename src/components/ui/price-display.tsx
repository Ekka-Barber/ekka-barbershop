
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
    lg: "text-lg"
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-1",
        "flex-row", // Always left-to-right for currency symbol
        sizeClasses[size],
        className
      )}
      dir="ltr" // Force LTR for price display
    >
      <RiyalIcon className={cn(
        size === 'sm' && "w-3.5 h-3.5",
        size === 'base' && "w-4 h-4",
        size === 'lg' && "w-5 h-5"
      )} />
      <span>{formatNumber(price)}</span>
      {showDiscount && originalPrice && originalPrice > price && (
        <span className="text-muted-foreground line-through text-sm ml-2">
          <RiyalIcon className="w-3.5 h-3.5" />
          {formatNumber(originalPrice)}
        </span>
      )}
    </div>
  );
};
