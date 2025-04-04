
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

interface ValidationOverlayProps {
  isValidating: boolean;
  message?: string;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({ 
  isValidating,
  message 
}) => {
  const { language } = useLanguage();

  if (!isValidating) return null;

  // Default messages with proper translations
  const defaultMessage = language === 'ar' 
    ? "جاري التحقق..." 
    : "Validating...";

  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
      <div className="animate-pulse flex flex-col items-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
        <span className="text-sm text-gray-700 font-medium">
          {message || defaultMessage}
        </span>
      </div>
    </div>
  );
};
