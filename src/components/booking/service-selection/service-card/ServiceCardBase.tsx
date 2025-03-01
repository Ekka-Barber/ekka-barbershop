
import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative p-4 rounded-lg shadow-sm border cursor-pointer transition-all duration-300",
        isSelected
          ? "border-green-500 bg-green-50 shadow-md"
          : "border-gray-200 bg-white hover:shadow",
        isSelecting && "border-green-300",
        className
      )}
    >
      {hasDiscount && discountPercentage && (
        <div className="absolute -top-2 left-2 z-10">
          <CustomBadge variant="discount" className="rounded-full shadow-sm animate-pulse-once">
            -{Math.round(discountPercentage)}%
          </CustomBadge>
        </div>
      )}
      
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
      
      {children}
    </motion.div>
  );
};

