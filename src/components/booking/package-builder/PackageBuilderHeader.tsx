
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface PackageBuilderHeaderProps {
  language: string;
}

export const PackageBuilderHeader = ({
  language
}: PackageBuilderHeaderProps) => {
  const { t } = useLanguage();
  
  return <DialogHeader className={language === 'ar' ? "text-right" : "text-left"}>
      <DialogTitle className="text-center">
        {language === 'ar' ? t('build.package') : 'Build Your Package'}
      </DialogTitle>
      <DialogDescription>
        {language === 'ar' ? 'أضف خدمات إضافية للحصول على خصومات' : 'Add additional services to get discounts'}
      </DialogDescription>
    </DialogHeader>;
};
