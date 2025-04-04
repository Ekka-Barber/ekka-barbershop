
import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Tag } from "lucide-react";
import { PackageBadge } from "./PackageBadge";

interface ServiceCardBaseProps extends Omit<HTMLMotionProps<"div">, "isSelected" | "isSelecting" | "hasDiscount" | "discountPercentage"> {
  isSelected: boolean;
  isSelecting?: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
  isBasePackageService?: boolean;
  children: React.ReactNode;
}

export const ServiceCardBase = ({
  isSelected,
  isSelecting = false,
  hasDiscount,
  discountPercentage,
  isBasePackageService = false,
  children,
  className,
  ...props
}: ServiceCardBaseProps) => {
  return (
    <motion.div 
      className={cn(
        "border rounded-lg p-4 relative cursor-pointer shadow-sm",
        "transition-all duration-150 hover:shadow-md",
        isSelected 
          ? "border-[#e7bd71] bg-[#FDF9EF] shadow-[0_0_0_1px_rgba(231,189,113,0.3)]" 
          : "border-border hover:border-[#e7bd71]",
        className
      )}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      animate={isSelecting ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {isBasePackageService && <PackageBadge />}
      
      {hasDiscount && discountPercentage && (
        <div className="absolute top-0 left-0 transform -translate-x-1/4 -translate-y-1/3 z-10">
          <div className="text-white text-xs font-bold flex items-center shadow-md px-[4px] py-[3px] bg-red-500 rounded-full">
            <Tag className="w-3 h-3 mr-1" />
            <span>{discountPercentage}%</span>
          </div>
        </div>
      )}
      
      {children}
    </motion.div>
  );
};
