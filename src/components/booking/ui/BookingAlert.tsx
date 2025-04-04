
import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { logger } from "@/utils/logger";

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface BookingAlertProps {
  title?: string;
  message: string;
  variant: AlertVariant;
  className?: string;
  onClose?: () => void;
  compact?: boolean;
  logLevel?: 'error' | 'warn' | 'info' | 'debug' | 'none';
  logDetails?: Record<string, any>;
}

export const BookingAlert = ({
  title,
  message,
  variant = 'info',
  className,
  onClose,
  compact = false,
  logLevel = 'info',
  logDetails
}: BookingAlertProps) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  // Log alert messages based on their variant and specified log level
  React.useEffect(() => {
    if (logLevel === 'none') return;
    
    const logMessage = `[${variant.toUpperCase()}] ${title ? `${title}: ` : ''}${message}`;
    
    switch (logLevel) {
      case 'error':
        logger.error(logMessage, logDetails);
        break;
      case 'warn':
        logger.warn(logMessage, logDetails);
        break;
      case 'debug':
        logger.debug(logMessage, logDetails);
        break;
      case 'info':
      default:
        logger.info(logMessage, logDetails);
        break;
    }
  }, [variant, title, message, logLevel, logDetails]);
  
  // Icon and color based on variant
  const variantConfig = {
    error: {
      icon: AlertCircle,
      containerClass: 'border-red-100 bg-red-50 text-red-800',
      iconClass: 'text-red-500'
    },
    success: {
      icon: CheckCircle,
      containerClass: 'border-green-100 bg-green-50 text-green-800',
      iconClass: 'text-green-500'
    },
    warning: {
      icon: AlertTriangle,
      containerClass: 'border-yellow-100 bg-yellow-50 text-yellow-800',
      iconClass: 'text-yellow-500'
    },
    info: {
      icon: InfoIcon, 
      containerClass: 'border-blue-100 bg-blue-50 text-blue-800',
      iconClass: 'text-blue-500'
    }
  };
  
  const IconComponent = variantConfig[variant].icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        'p-4 rounded-lg border flex items-start space-x-3 rtl:space-x-reverse shadow-sm',
        variantConfig[variant].containerClass,
        compact ? 'p-3' : 'p-4',
        className
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <IconComponent className={cn('flex-shrink-0', variantConfig[variant].iconClass, compact ? 'w-4 h-4 mt-0.5' : 'w-5 h-5 mt-0.5')} />
      <div className="flex-1">
        {title && <p className={cn("font-medium", compact ? 'text-sm' : '')}>{title}</p>}
        <p className={cn(compact ? "text-xs" : "text-sm")}>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={() => {
            logger.debug(`Alert closed: ${variant} - ${message}`);
            onClose();
          }} 
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </motion.div>
  );
};
