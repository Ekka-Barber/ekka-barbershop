
import React from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast, dismiss } = useToast();
  
  const handleConfirm = () => {
    // Dismiss any toasts before confirming
    dismiss();
    onConfirm();
  };

  const handleSkip = () => {
    dismiss();
    onClose();
  };

  return (
    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0 mt-6">
      <Button
        variant="outline"
        onClick={handleSkip}
        className="sm:mr-2"
      >
        {language === 'ar' ? 'متابعة بدون باقة' : 'Continue without Package'}
      </Button>
      <Button 
        onClick={handleConfirm}
        disabled={isConfirmDisabled}
      >
        {language === 'ar' ? 'تأكيد الباقة' : 'Confirm Package'}
      </Button>
    </DialogFooter>
  );
};
