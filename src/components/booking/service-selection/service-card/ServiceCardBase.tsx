import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";
import { Tag } from "lucide-react";
interface ServiceCardBaseProps extends Omit<HTMLMotionProps<"div">, "isSelected" | "isSelecting" | "hasDiscount" | "discountPercentage"> {
  isSelected: boolean;
  isSelecting?: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
  children: React.ReactNode;
}
export const ServiceCardBase = ({
  isSelected,
  isSelecting = false,
  hasDiscount,
  discountPercentage,
  children,
  className,
  ...props
}: ServiceCardBaseProps) => {
  return <motion.div className={cn("border rounded-lg p-4 relative cursor-pointer", "transition-all duration-150", isSelected ? "border-[#e7bd71] bg-[#FDF9EF]" : "border-border hover:border-[#e7bd71]", className)} initial={{
    scale: 1
  }} whileHover={{
    scale: 1.01
  }} whileTap={{
    scale: 0.99
  }} animate={isSelecting ? {
    scale: [1, 1.02, 1]
  } : {
    scale: 1
  }} transition={{
    duration: 0.15
  }} {...props}>
      {hasDiscount && discountPercentage && <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/3 z-10">
          <div className="text-white text-xs font-bold flex items-center shadow-md px-[4px] py-[3px] mx-[208px] bg-red-500 rounded-full">
            <Tag className="w-3 h-3 mr-1" />
            <span>-{discountPercentage}%</span>
          </div>
        </div>}
      {children}
    </motion.div>;
};