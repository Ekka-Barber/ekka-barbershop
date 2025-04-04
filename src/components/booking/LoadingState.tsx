
import React from 'react';
import { Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

export const LoadingState = ({ 
  message, 
  size = 'md', 
  className,
  center = true,
  error = false,
  errorMessage,
  onRetry
}: LoadingStateProps) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  
  // Log errors using the logger utility
  React.useEffect(() => {
    if (error && errorMessage) {
      logger.error(`Loading error: ${errorMessage}`);
    }
  }, [error, errorMessage]);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const defaultMessage = isRTL ? 'جاري التحميل...' : 'Loading...';
  const defaultErrorMessage = isRTL ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.';
  
  return (
    <div className={cn(
      "flex flex-col items-center py-6 space-y-3",
      center && "justify-center",
      isRTL && "rtl",
      className
    )}>
      <div className="relative">
        {error ? (
          <AlertCircle className={cn(
            "text-destructive",
            sizeClasses[size]
          )} />
        ) : (
          <>
            <Loader2 className={cn(
              "animate-spin text-primary",
              sizeClasses[size]
            )} />
            <div className="absolute inset-0 blur-sm opacity-50 animate-pulse">
              <Loader2 className={cn(
                "text-primary/30",
                sizeClasses[size]
              )} />
            </div>
          </>
        )}
      </div>
      <p className={cn(
        "text-muted-foreground font-medium text-sm",
        isRTL && "text-right"
      )}>
        {error 
          ? (errorMessage || defaultErrorMessage) 
          : (message || defaultMessage)
        }
      </p>
      {error && onRetry && (
        <button 
          onClick={onRetry}
          className="text-xs text-primary hover:text-primary/80 transition-colors underline mt-2"
        >
          {isRTL ? 'إعادة المحاولة' : 'Try Again'}
        </button>
      )}
    </div>
  );
};

export const LoadingOverlay = ({ 
  message, 
  blur = true,
  error = false,
  errorMessage,
  onRetry
}: { 
  message?: string; 
  blur?: boolean;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const defaultMessage = isRTL ? 'جاري التحميل...' : 'Loading...';
  const defaultErrorMessage = isRTL ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'An error occurred. Please try again.';
  
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center z-50",
      blur ? "bg-background/80 backdrop-blur-sm" : "bg-background/50"
    )}>
      <div className={cn(
        "flex flex-col items-center justify-center space-y-4",
        isRTL && "rtl"
      )}>
        <div className="relative">
          {error ? (
            <AlertCircle className="w-8 h-8 text-destructive" />
          ) : (
            <>
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <div className="absolute inset-0 blur-sm opacity-50 animate-pulse">
                <Loader2 className="w-8 h-8 text-primary/30" />
              </div>
            </>
          )}
        </div>
        <p className={cn(
          "text-muted-foreground font-medium",
          isRTL && "text-right"
        )}>
          {error 
            ? (errorMessage || defaultErrorMessage) 
            : (message || defaultMessage)
          }
        </p>
        {error && onRetry && (
          <button 
            onClick={onRetry}
            className="text-sm text-primary hover:text-primary/80 transition-colors underline mt-2"
          >
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
};
