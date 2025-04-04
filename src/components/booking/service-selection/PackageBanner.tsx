
import React from 'react';
import { Package, Info } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PackageBannerProps {
  isVisible: boolean;
  onInfoClick: () => void;
  hasBaseService?: boolean;
  onBuildPackage?: () => void;
}

export const PackageBanner = ({
  isVisible,
  onInfoClick,
  hasBaseService,
  onBuildPackage
}: PackageBannerProps) => {
  const { language } = useLanguage();
  const { toast } = useToast();
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mb-4 animate-fade-in shadow-sm">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-start sm:items-center gap-2">
          <Package className="w-5 h-5 text-[#C4A484] flex-shrink-0 mt-1 sm:mt-0" />
          <div className="flex-1">
            <p className={cn(
              "font-medium text-red-600",
              language === 'ar' ? 'text-right' : ''
            )}>
              {language === 'ar' 
                ? 'أصنع باقتك بنفسك .. خدمات أكثر خصم أكبر 😉' 
                : 'Packages now available! Select Haircut & Beard Trim and add services at a discount 😉'}
            </p>
          </div>
        </div>
        <div className={cn(
          "flex justify-between items-center mt-1",
          language === 'ar' ? 'flex-row-reverse' : ''
        )}>
          <button 
            onClick={onInfoClick}
            className="text-xs text-[#6f5b3e] hover:text-[#C4A484] transition-colors underline cursor-pointer"
          >
            {language === 'ar' ? 'إعرف أكثر' : 'Learn more'}
          </button>
          
          {onBuildPackage && (
            <Button 
              onClick={onBuildPackage}
              variant="outline" 
              size="sm"
              className="text-xs bg-[#FCF9F0] border-[#e9d8a6] text-[#6f5b3e] hover:bg-[#e9d8a6]/20"
            >
              {language === 'ar' ? 'إنشاء باقة' : 'Build Package'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
