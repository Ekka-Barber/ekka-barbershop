
import React from 'react';
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";

interface PriceItemProps {
  label: string;
  price: number;
  language: string;
  icon?: React.ReactNode;
  className?: string;
  isRTL: boolean;
}

/**
 * A reusable price item component that displays a label and price
 * with proper RTL support and optional icon
 */
export const PriceItem = ({
  label,
  price,
  language,
  icon,
  className,
  isRTL
}: PriceItemProps) => {
  return (
    <div className={cn(
      "flex justify-between text-sm",
      isRTL && "flex-row-reverse",
      className
    )}>
      <PriceDisplay 
        price={price} 
        language={language as 'en' | 'ar'} 
        size="sm"
        className={className}
      />
      
      <span className={cn(
        "flex items-center gap-1.5",
        isRTL && "flex-row-reverse"
      )}>
        {isRTL ? (
          <>
            {label}
            {icon}
          </>
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </span>
    </div>
  );
};
