
import React from "react";
import { motion } from "framer-motion";
import { PriceDisplay } from "@/components/ui/price-display";

interface ServiceCardPriceProps {
  price: number;
  finalPrice: number;
  hasDiscount: boolean;
  language: string;
}

export const ServiceCardPrice = ({ 
  price, 
  finalPrice, 
  hasDiscount, 
  language 
}: ServiceCardPriceProps) => {
  return (
    <div className="ml-auto text-right">
      {hasDiscount ? (
        <div className="flex flex-col items-end">
          <motion.div
            key={finalPrice}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-medium"
          >
            <PriceDisplay 
              price={finalPrice}
              language={language as 'en' | 'ar'}
              size="base"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="line-through text-[#ea384c] text-xs mt-0.5"
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
            size="base"
          />
        </motion.div>
      )}
    </div>
  );
};
