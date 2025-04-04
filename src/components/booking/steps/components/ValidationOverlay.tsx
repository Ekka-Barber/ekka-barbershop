
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";

interface ValidationOverlayProps {
  isValidating: boolean;
  message?: string;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  isSuccess?: boolean;
  successMessage?: string;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({ 
  isValidating,
  message,
  hasError = false,
  errorMessage,
  onRetry,
  isSuccess = false,
  successMessage
}) => {
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  // Log validation errors
  React.useEffect(() => {
    if (hasError && errorMessage) {
      logger.error(`Validation error: ${errorMessage}`);
    } else if (isSuccess && successMessage) {
      logger.info(`Validation success: ${successMessage}`);
    }
  }, [hasError, errorMessage, isSuccess, successMessage]);

  if (!isValidating && !hasError && !isSuccess) return null;

  // Default messages with proper translations
  const defaultValidatingMessage = t('validation.processing');
  const defaultErrorMessage = t('validation.error');
  const defaultSuccessMessage = t('validation.success');

  return (
    <div 
      className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className={cn(
        "flex flex-col items-center p-6 rounded-lg shadow-sm",
        hasError ? "bg-red-50" : isSuccess ? "bg-green-50" : "animate-pulse"
      )}>
        {hasError ? (
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
        ) : isSuccess ? (
          <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
        ) : (
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        )}
        <span className={cn(
          "text-sm font-medium text-center",
          hasError ? "text-red-700" : isSuccess ? "text-green-700" : "text-gray-700"
        )}>
          {hasError 
            ? (errorMessage || defaultErrorMessage)
            : isSuccess
              ? (successMessage || defaultSuccessMessage)
              : (message || defaultValidatingMessage)
          }
        </span>
        
        {hasError && onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-3 py-1 text-xs rounded-md bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
          >
            {t('retry')}
          </button>
        )}
      </div>
    </div>
  );
};
