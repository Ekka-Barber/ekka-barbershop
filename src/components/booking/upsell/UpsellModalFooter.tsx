
import React from 'react';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface UpsellModalFooterProps {
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const UpsellModalFooter = ({ isLoading, onConfirm, onClose }: UpsellModalFooterProps) => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col gap-3 p-5 border-t bg-background/95 backdrop-blur-sm">
      <Button 
        className="bg-[#e7bd71] hover:bg-[#c4a36f] h-11 text-base font-medium shadow-sm group" 
        onClick={onConfirm} 
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
          </span>
        ) : (
          <span>
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </span>
        )}
      </Button>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={onClose} 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              {language === 'ar' ? 'تخطي' : 'Skip'}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{language === 'ar' ? 'تخطي العروض الخاصة' : 'Skip special offers'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
