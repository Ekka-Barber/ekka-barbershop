
import React from 'react';
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const UpsellModalHeader = () => {
  const { language } = useLanguage();

  return (
    <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b border-border/30">
      <DialogTitle className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-xl font-bold">
          {language === 'ar' ? (
            <>
              <Gift className="text-[#e7bd71] animate-pulse" />
              <span>عروض حصرية لك</span>
              <Gift className="text-[#e7bd71] animate-pulse" />
            </>
          ) : (
            <>
              <Gift className="text-[#e7bd71] animate-pulse" />
              <span>Special Offers Available!</span>
              <Gift className="text-[#e7bd71] animate-pulse" />
            </>
          )}
        </div>
        {language === 'ar' && (
          <div className="flex items-center justify-center gap-2 text-base font-bold">
            <span className="text-[#e7bd71]">🔥</span>
            <span>اجعل تجربتك أفضل بأقل سعر</span>
            <span className="text-[#e7bd71]">🔥</span>
          </div>
        )}
      </DialogTitle>
    </DialogHeader>
  );
};
