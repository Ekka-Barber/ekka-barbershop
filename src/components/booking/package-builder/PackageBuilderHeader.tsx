
import React from 'react';
import { X } from 'lucide-react';
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PackageBuilderHeaderProps {
  language: string;
  onClose: () => void;
}

export const PackageBuilderHeader = ({ language, onClose }: PackageBuilderHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle>
        {language === 'ar' ? 'بناء باقتك' : 'Build Your Package'}
      </DialogTitle>
      <DialogDescription>
        {language === 'ar' 
          ? 'أضف خدمات إضافية للحصول على خصومات'
          : 'Add additional services to get discounts'}
      </DialogDescription>
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute right-4 top-4" 
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </DialogHeader>
  );
};
