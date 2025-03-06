
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Package } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface PackageSummaryProps {
  originalTotal: number;
  discountedTotal: number;
  savings: number;
  language: string;
}

export const PackageSummary = ({
  originalTotal,
  discountedTotal,
  savings,
  language
}: PackageSummaryProps) => {
  return (
    <div className="space-y-3 pt-2">
      <Separator />
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {language === 'ar' ? 'المجموع الأصلي:' : 'Original Total:'}
          </span>
          <span>
            {language === 'ar' ? `${originalTotal} ر.س` : `SAR ${originalTotal}`}
          </span>
        </div>
        
        {savings > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span className="flex items-center">
              <Package className="h-3.5 w-3.5 mr-1.5" />
              {language === 'ar' ? 'توفير الباقة:' : 'Package Savings:'}
            </span>
            <span>
              {language === 'ar' ? `${savings} - ر.س` : `- SAR ${savings}`}
            </span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className="flex justify-between font-medium">
          <span>
            {language === 'ar' ? 'المجموع النهائي:' : 'Final Total:'}
          </span>
          <motion.span
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            {language === 'ar' ? `${discountedTotal} ر.س` : `SAR ${discountedTotal}`}
          </motion.span>
        </div>
      </div>
      
      {savings > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-md p-2 text-sm text-center text-green-700">
          {language === 'ar' 
            ? `ستوفر ${savings} ر.س مع هذه الباقة!` 
            : `You'll save SAR ${savings} with this package!`}
        </div>
      )}
    </div>
  );
};
