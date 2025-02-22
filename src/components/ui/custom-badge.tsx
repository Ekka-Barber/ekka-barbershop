
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface CustomBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "discount";
}

export function CustomBadge({ className, variant = "default", ...props }: CustomBadgeProps) {
  const { language } = useLanguage();
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-[#F2FCE2] text-green-700 font-bold hover:bg-[#F2FCE2]/80",
    destructive: "bg-[#FFDEE2] text-red-700 hover:bg-[#FFDEE2]/80",
    outline: "text-foreground",
    success: "bg-[#F2FCE2] text-green-700 font-bold hover:bg-[#F2FCE2]/80",
    discount: "bg-[#FFDEE2] text-[#ea384c] font-bold hover:bg-[#FFDEE2]/80",
  };

  return (
    <Badge
      className={cn(
        variantClasses[variant],
        "text-xs font-medium px-2 py-1",
        language === 'ar' ? "font-sans" : "",
        className
      )}
      {...props}
    />
  );
}
