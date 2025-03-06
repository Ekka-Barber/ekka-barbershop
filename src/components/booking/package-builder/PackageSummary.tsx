
import React from 'react';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/ui/price-display";

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
        <div className={`flex justify-between text-sm ${language === 'ar' ? "flex-row-reverse" : ""}`}>
          <span className="text-muted-foreground">
            {language === 'ar' ? 'المجموع الأصلي:' : 'Original Total:'}
          </span>
          <PriceDisplay 
            price={originalTotal} 
            language={language as 'en' | 'ar'} 
            size="sm"
          />
        </div>
        
        {savings > 0 && (
          <div className={`flex justify-between text-sm text-green-600 ${language === 'ar' ? "flex-row-reverse" : ""}`}>
            <span className="flex items-center">
              <Package className={`h-3.5 w-3.5 ${language === 'ar' ? "ml-1.5" : "mr-1.5"}`} />
              {language === 'ar' ? 'توفير الباقة:' : 'Package Savings:'}
            </span>
            <span className="flex items-center">
              {language === 'ar' ? '-' : ''} 
              <PriceDisplay 
                price={savings} 
                language={language as 'en' | 'ar'} 
                size="sm"
                className="text-green-600"
              />
              {language === 'ar' ? '' : '-'}
            </span>
          </div>
        )}
        
        <Separator className="my-2" />
        
        <div className={`flex justify-between font-medium ${language === 'ar' ? "flex-row-reverse" : ""}`}>
          <span>
            {language === 'ar' ? 'المجموع النهائي:' : 'Final Total:'}
          </span>
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
          >
            <PriceDisplay 
              price={discountedTotal} 
              language={language as 'en' | 'ar'} 
              size="base"
              className="font-medium"
            />
          </motion.div>
        </div>
      </div>
      
      {savings > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-md p-2 text-sm text-center text-green-700">
          {language === 'ar' 
            ? 'ستوفر ' 
            : "You'll save "}
          <PriceDisplay 
            price={savings} 
            language={language as 'en' | 'ar'} 
            size="sm"
            className="text-green-700 font-medium inline-flex"
          />
          {language === 'ar' 
            ? ' مع هذه الباقة!' 
            : ' with this package!'}
        </div>
      )}
    </div>
  );
};
