
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
  const { language } = useLanguage();
  const { toast } = useToast();
  
  if (!isVisible) return null;
  
  const handleBuildPackageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBuildPackage) {
      // Remove the dismiss call which doesn't exist on the toast function
      onBuildPackage();
    }
  };
  
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
        <div className="flex justify-between items-center mt-1">
          <button 
            onClick={onInfoClick}
            className="text-xs text-[#6f5b3e] hover:text-[#C4A484] transition-colors underline cursor-pointer"
          >
            {language === 'ar' ? 'إعرف أكثر' : 'Learn more'}
          </button>
          
          {hasBaseService && onBuildPackage && (
            <button
              onClick={handleBuildPackageClick}
              className="text-xs bg-[#C4A484] hover:bg-[#b3946f] text-white py-1 px-2 rounded-md transition-colors flex items-center gap-1"
            >
              <Package className="w-3 h-3" />
              {language === 'ar' ? 'بناء باقة' : 'Build Package'}
            </button>
          )}
        </div>
      </div>
    </div>;
};
