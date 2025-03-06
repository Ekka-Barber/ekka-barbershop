
import React from 'react';
import { Package } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
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
  const {
    language
  } = useLanguage();
  const {
    dismiss
  } = useToast();
  
  if (!isVisible) return null;
  
  return <div className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mb-4 animate-fade-in">
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-[#C4A484] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-600">
              {language === 'ar' ? 'أصنع باقتك بنفسك .. خدمات أكثر خصم أكبر 😉' : 'Packages now available! Select Haircut & Beard Trim and add services at a discount 😉'}
            </p>
          </div>
        </div>
        <div className="flex justify-start mt-1">
          <button 
            onClick={onInfoClick}
            className="text-xs text-[#6f5b3e] hover:text-[#C4A484] transition-colors underline cursor-pointer"
          >
            {language === 'ar' ? 'إعرف أكثر' : 'Learn more'}
          </button>
        </div>
      </div>
    </div>;
};
