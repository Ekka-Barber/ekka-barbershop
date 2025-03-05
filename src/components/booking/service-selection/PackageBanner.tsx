
import React from 'react';
import { Package, Info } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PackageBannerProps {
  isVisible: boolean;
  onInfoClick: () => void;
}

export const PackageBanner = ({ isVisible, onInfoClick }: PackageBannerProps) => {
  const { language } = useLanguage();
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mb-4 animate-fade-in">
      <div className="flex items-center gap-2 text-sm">
        <Package className="w-5 h-5 text-[#C4A484] flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium text-[#6f5b3e]">
            {language === 'ar' 
              ? 'الباقات متاحة الآن! اختر خدمة القص مع اللحية وأضف خدمات إضافية بخصم'
              : 'Packages now available! Select Haircut & Beard Trim and add services at a discount'}
          </p>
        </div>
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
  );
};
