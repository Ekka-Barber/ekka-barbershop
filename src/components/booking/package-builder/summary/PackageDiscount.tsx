
import React from 'react';
import { cn } from "@/lib/utils";
import { Tag } from 'lucide-react';

interface PackageDiscountProps {
  discountPercentage: string;
  isRTL: boolean;
  label: string;
}

/**
 * Component that displays the package discount with proper RTL support
 */
export const PackageDiscount = ({
  discountPercentage,
  isRTL,
  label
}: PackageDiscountProps) => {
  return (
    <div className={cn(
      "flex justify-between text-sm",
      isRTL && "flex-row-reverse"
    )}>
      <span className="text-primary font-medium">
        {discountPercentage}
      </span>
      {isRTL ? (
        <span className="flex items-center gap-1.5 flex-row-reverse">
          {label}
          <Tag className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5" />
          {label}
        </span>
      )}
    </div>
  );
};
