
import React, { useState } from 'react';
import { Package, Info } from 'lucide-react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { logger } from "@/utils/logger";
import { ValidationOverlay } from "@/components/booking/steps/components/ValidationOverlay";

interface PackageBannerProps {
  isVisible: boolean;
  onInfoClick: () => void;
  hasBaseService?: boolean;
  onBuildPackage?: () => void;
  isLoading?: boolean;
}

export const PackageBanner = ({
  isVisible,
  onInfoClick,
  hasBaseService,
  onBuildPackage,
  isLoading = false
}: PackageBannerProps) => {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const isRTL = language === 'ar';
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Log when package info is requested
  const handleInfoClick = () => {
    logger.info("Package info requested by user");
    onInfoClick();
  };
  
  // Log when package building is initiated
  const handleBuildPackage = () => {
    logger.info("Package building initiated by user");
    if (onBuildPackage) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      onBuildPackage();
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="relative">
      {isLoading && (
        <ValidationOverlay 
          isValidating={true} 
          message={t('package.loading')}
        />
      )}
      
      {showSuccess && (
        <ValidationOverlay 
          isSuccess={true} 
          successMessage={t('package.added')}
        />
      )}
      
      <div 
        className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mb-4 animate-fade-in shadow-sm"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-start sm:items-center gap-2">
            <Package className="w-5 h-5 text-[#C4A484] flex-shrink-0 mt-1 sm:mt-0" />
            <div className="flex-1">
              <p className="font-medium text-red-600">
                {t('package.banner')}
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-1">
            <button 
              onClick={handleInfoClick}
              className="text-xs text-[#6f5b3e] hover:text-[#C4A484] transition-colors underline cursor-pointer"
            >
              {t('learn.more')}
            </button>
            
            {onBuildPackage && (
              <Button 
                onClick={handleBuildPackage}
                variant="outline" 
                size="sm"
                className="text-xs bg-[#FCF9F0] border-[#e9d8a6] text-[#6f5b3e] hover:bg-[#e9d8a6]/20"
                disabled={isLoading}
              >
                {t('build.package')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
