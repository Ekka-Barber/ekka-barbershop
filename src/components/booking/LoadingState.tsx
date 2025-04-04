
import React from 'react';
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = ({ message, size = 'md' }: LoadingStateProps) => {
  const { language } = useLanguage();
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  const defaultMessage = language === 'ar' ? 'جاري التحميل...' : 'Loading...';
  
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
      <p className="text-muted-foreground font-medium text-sm">
        {message || defaultMessage}
      </p>
    </div>
  );
};

export const LoadingOverlay = ({ message }: { message?: string }) => {
  const { language } = useLanguage();
  const defaultMessage = language === 'ar' ? 'جاري التحميل...' : 'Loading...';
  
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">
          {message || defaultMessage}
        </p>
      </div>
    </div>
  );
};
