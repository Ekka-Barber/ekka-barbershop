
import { cn } from "@/lib/utils";
import React from "react";

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: 2 | 4 | 6 | 8;
}

export const Grid = ({ 
  children, 
  className,
  cols = 2,
  gap = 4,
  ...props 
}: GridProps) => {
  return (
    <div
      className={cn(
        "grid",
        `grid-cols-${cols}`,
        `gap-${gap}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
