
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface ActionButtonProps {
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'error';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  showPrevIcon?: boolean;
  showNextIcon?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
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
  hasError = false,
  errorMessage,
  className,
  fullWidth = false,
  children
}: ActionButtonProps) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  // Log button errors
  React.useEffect(() => {
    if (hasError && errorMessage) {
      logger.error(`Button action error: ${errorMessage}`);
    }
  }, [hasError, errorMessage]);
  
  // Adjust icons for RTL layout
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;
  
  // Button styling variants
  const variantClasses = {
    primary: "bg-[#C4A484] hover:bg-[#B39476] text-white",
    secondary: "bg-secondary hover:bg-secondary/90",
    outline: "border border-border bg-transparent hover:bg-secondary/10",
    error: "bg-red-500 hover:bg-red-600 text-white"
  };
  
  // Button sizing
  const sizeClasses = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-6",
    lg: "h-11 px-8 text-lg"
  };
  
  // Handle button click with error logging
  const handleClick = () => {
    if (hasError) {
      logger.warn("Button clicked while in error state:", errorMessage);
    }
    
    try {
      onClick();
    } catch (error) {
      logger.error("Error in button click handler:", error);
    }
  };
  
  return (
    <div className={cn(fullWidth ? "w-full" : "")}>
      <Button
        onClick={handleClick}
        disabled={isDisabled || isLoading}
        className={cn(
          variantClasses[hasError ? 'error' : variant],
          sizeClasses[size],
          "relative transition-all shadow-sm rounded-md",
          isDisabled && "opacity-50 cursor-not-allowed",
          fullWidth && "w-full",
          className
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-center gap-2">
          {showPrevIcon && !isLoading && <PrevIcon className="w-4 h-4" />}
          
          {hasError && <AlertCircle className="w-4 h-4" />}
          
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {label || t('loading')}
            </span>
          ) : (
            <span>{label || children}</span>
          )}
          
          {showNextIcon && !isLoading && <NextIcon className="w-4 h-4" />}
        </div>
      </Button>
      
      {hasError && errorMessage && (
        <p className={cn(
          "text-xs text-red-500 mt-1",
          isRTL ? "text-right" : "text-left"
        )}>
          {errorMessage}
        </p>
      )}
    </div>
  );
};
