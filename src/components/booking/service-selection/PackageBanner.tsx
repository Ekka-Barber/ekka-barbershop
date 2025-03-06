
import React from 'react';
import { Package, Info, Sparkles } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PackageBannerProps {
  isVisible: boolean;
  onInfoClick: () => void;
  hasBaseService?: boolean;
  onBuildPackage?: () => void;
}

export const PackageBanner = ({ 
  isVisible, 
  onInfoClick,
  hasBaseService = false,
  onBuildPackage
}: PackageBannerProps) => {
  const { language } = useLanguage();
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 text-sm">
        <Package className="w-5 h-5 text-[#C4A484] flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-[#6f5b3e]">
            {language === 'ar' 
              ? 'أصنع باقتك بنفسك، أضف خدمات على باقة حلاقة الشعر والدقن.. خدمات أكثر خصم أكبر 😉'
              : 'Packages now available! Select Haircut & Beard Trim and add services at a discount 😉'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {hasBaseService && onBuildPackage && (
            <Button 
              variant="outline" 
              size="sm"
              className="h-8 bg-[#C4A484]/10 border-[#C4A484]/20 text-[#6f5b3e] hover:bg-[#C4A484]/20"
              onClick={onBuildPackage}
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-[#C4A484]" />
              {language === 'ar' ? 'بناء باقة' : 'Build Package'}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-[#e9d8a6]/50"
            onClick={onInfoClick}
          >
            <Info className="h-4 w-4 text-[#6f5b3e]" />
          </Button>
        </div>
      </div>
    </div>
  );
};
