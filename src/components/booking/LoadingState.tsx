
import React from 'react';
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
}

export const LoadingState = ({ 
  message, 
  size = 'md', 
  className,
  center = true 
}: LoadingStateProps) => {
  const { language } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const defaultMessage = language === 'ar' ? 'جاري التحميل...' : 'Loading...';
  
  return (
    <div className={cn(
      "flex flex-col items-center py-6 space-y-3",
      center && "justify-center",
      className
    )}>
      <div className="relative">
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
      </div>
      <p className="text-muted-foreground font-medium text-sm">
        {message || defaultMessage}
      </p>
    </div>
  );
};

export const LoadingOverlay = ({ 
  message, 
  blur = true 
}: { 
  message?: string; 
  blur?: boolean;
}) => {
  const { language } = useLanguage();
  const defaultMessage = language === 'ar' ? 'جاري التحميل...' : 'Loading...';
  
  return (
    <div className={cn(
      "absolute inset-0 flex items-center justify-center z-50",
      blur ? "bg-background/80 backdrop-blur-sm" : "bg-background/50"
    )}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div className="absolute inset-0 blur-sm opacity-50 animate-pulse">
            <Loader2 className="w-8 h-8 text-primary/30" />
          </div>
        </div>
        <p className="text-muted-foreground font-medium">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
};
