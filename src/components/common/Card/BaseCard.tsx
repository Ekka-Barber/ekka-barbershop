
import { cn } from "@/lib/utils";
import React from "react";

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  isSelected?: boolean;
}

export const BaseCard = ({ 
  children, 
  className,
  isSelected,
  ...props 
}: BaseCardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-2 transition-all",
        isSelected ? 'bg-[#e7bd71]/10 border-[#e7bd71]' : 'hover:border-gray-300',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
