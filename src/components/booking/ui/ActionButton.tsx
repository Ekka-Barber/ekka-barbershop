
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ActionButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  showPrevIcon?: boolean;
  showNextIcon?: boolean;
  className?: string;
  fullWidth?: boolean;
}

export const ActionButton = ({
  onClick,
  label,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  showPrevIcon = false,
  showNextIcon = false,
  className,
  fullWidth = false
}: ActionButtonProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // Adjust icons for RTL layout
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  
  // Button styling variants
  const variantClasses = {
    primary: "bg-[#C4A484] hover:bg-[#B39476] text-white",
    secondary: "bg-secondary hover:bg-secondary/90",
    outline: "border border-border bg-transparent hover:bg-secondary/10"
  };
  
  // Button sizing
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-6",
    lg: "h-11 px-8 text-lg"
  };
  
  return (
    <Button
      onClick={onClick}
      disabled={isDisabled || isLoading}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        "relative transition-all shadow-sm",
        fullWidth && "w-full",
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-center gap-2">
        {showPrevIcon && !isLoading && <PrevIcon className="w-4 h-4" />}
        
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            {label || (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
          </span>
        ) : (
          <span>{label}</span>
        )}
        
        {showNextIcon && !isLoading && <NextIcon className="w-4 h-4" />}
      </div>
    </Button>
  );
};
