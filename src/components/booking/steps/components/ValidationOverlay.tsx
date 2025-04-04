
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ValidationOverlayProps {
  isValidating: boolean;
}

export const ValidationOverlay: React.FC<ValidationOverlayProps> = ({ isValidating }) => {
  const { language } = useLanguage();

  if (!isValidating) return null;

  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
        <span className="text-sm text-gray-500">
          {language === 'ar' ? "جاري التحقق..." : "Validating..."}
        </span>
      </div>
    </div>
  );
};
