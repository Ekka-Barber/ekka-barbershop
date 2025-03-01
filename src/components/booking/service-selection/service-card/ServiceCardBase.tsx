
import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CustomBadge } from "@/components/ui/custom-badge";

interface ServiceCardBaseProps {
  children: React.ReactNode;
  isSelected: boolean;
  isSelecting: boolean;
  hasDiscount: boolean;
  discountPercentage?: number;
  onClick: () => void;
  className?: string;
}

export const ServiceCardBase = ({
  children,
  isSelected,
  isSelecting,
  hasDiscount,
  discountPercentage,
  onClick,
  className
}: ServiceCardBaseProps) => {
  return (
    <Card
      className={cn(
        "relative overflow-visible cursor-pointer transition-all p-4",
        isSelected 
          ? "border-[#C4A484] bg-[#C4A484]/5 animate-pulse-once" 
          : "hover:border-[#C4A484]/50 hover:scale-[1.01] transition-transform duration-200",
        isSelecting && "scale-95 opacity-80 transition-all duration-150",
        className
      )}
      onClick={onClick}
    >
      {hasDiscount && discountPercentage && (
        <div className="absolute -top-3 -left-3 animate-fade-in">
          <CustomBadge
            variant="discount"
            className="z-20"
          >
            -{discountPercentage}%
          </CustomBadge>
        </div>
      )}
      {children}
    </Card>
  );
};
