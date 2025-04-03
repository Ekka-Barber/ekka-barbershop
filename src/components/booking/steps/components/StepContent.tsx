
import { ReactNode } from "react";

interface StepContentProps {
  children: ReactNode;
  isValidating: boolean;
  language: string;
}

export const StepContent = ({ children, isValidating, language }: StepContentProps) => {
  return (
    <div className="mb-8 relative">
      {isValidating && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2"></div>
            <span className="text-sm text-gray-500">
              {language === 'ar' ? "جاري التحقق..." : "Validating..."}
            </span>
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};
