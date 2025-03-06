
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PackageBuilderFooterProps {
  language: string;
  onClose: () => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
}

export const PackageBuilderFooter = ({ 
  language, 
  onClose, 
  onConfirm, 
  isConfirmDisabled 
}: PackageBuilderFooterProps) => {
  return (
    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
      <Button
        variant="outline"
        onClick={onClose}
        className="sm:mr-2"
      >
        {language === 'ar' ? 'تخطي' : 'Skip'}
      </Button>
      <Button 
        onClick={onConfirm}
        disabled={isConfirmDisabled}
      >
        {language === 'ar' ? 'تأكيد الباقة' : 'Confirm Package'}
      </Button>
    </DialogFooter>
  );
};
