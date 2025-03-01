
import React from "react";
import { motion } from "framer-motion";
import { PriceDisplay } from "@/components/ui/price-display";

interface ServiceCardPriceProps {
  price: number;
  finalPrice?: number;
  hasDiscount?: boolean;
  language: string;
  discountType?: string;
  discountValue?: number;
  size?: 'sm' | 'base' | 'lg';
}

export const ServiceCardPrice = ({ 
  price, 
  finalPrice, 
  hasDiscount, 
  language,
  discountType,
  discountValue,
  size = 'base'
}: ServiceCardPriceProps) => {
  // Apply discount if finalPrice is not provided but discountType and discountValue are
  let calculatedFinalPrice = finalPrice;
  let calculatedHasDiscount = hasDiscount;
  
  if (finalPrice === undefined && discountType && discountValue) {
    calculatedHasDiscount = true;
    if (discountType === 'percentage') {
      calculatedFinalPrice = price - (price * (discountValue / 100));
    } else if (discountType === 'fixed') {
      calculatedFinalPrice = price - discountValue;
    } else {
      calculatedFinalPrice = price;
      calculatedHasDiscount = false;
    }
  } else if (finalPrice === undefined) {
    calculatedFinalPrice = price;
    calculatedHasDiscount = false;
  }

  const isRTL = language === 'ar';

  return (
    <div className={isRTL ? "mr-auto text-right" : "ml-auto text-right"}>
      {calculatedHasDiscount ? (
        <div className={`flex flex-col items-${isRTL ? 'start' : 'end'}`}>
          <motion.div
            key={calculatedFinalPrice}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium"
          >
            <PriceDisplay 
              price={calculatedFinalPrice}
              language={language as 'en' | 'ar'}
              size={size}
              className="text-black" // Changed from text-emerald-600 to text-black
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="line-through text-rose-500 text-xs mt-1"
          >
            <PriceDisplay 
              price={price}
              language={language as 'en' | 'ar'}
              size="sm"
            />
          </motion.div>
        </div>
      ) : (
        <motion.div
          key={price}
          className="font-medium"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
        >
          <PriceDisplay 
            price={price}
            language={language as 'en' | 'ar'}
            size={size}
          />
        </motion.div>
      )}
    </div>
  );
};
