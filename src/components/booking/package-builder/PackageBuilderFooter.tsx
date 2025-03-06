
import React from 'react';
import { Button } from "@/components/ui/button";
import { X, Check, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from 'framer-motion';

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
  const isRTL = language === 'ar';
  
  return (
    <div className={cn(
      "flex justify-between gap-3 mt-3",
      isRTL && "flex-row-reverse"
    )}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button
          variant="outline"
          onClick={onClose}
          className={cn(isRTL && "flex-row-reverse gap-2")}
        >
          <X className="h-4 w-4" />
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Button
          onClick={onConfirm}
          className={cn(
            "bg-primary hover:bg-primary/90",
            isRTL && "flex-row-reverse gap-2"
          )}
          disabled={isConfirmDisabled}
        >
          <Package className="h-4 w-4 mr-1" />
          {isRTL ? 'تأكيد الباقة' : 'Confirm Package'}
        </Button>
      </motion.div>
    </div>
  );
};
