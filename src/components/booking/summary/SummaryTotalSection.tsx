
import { motion } from "framer-motion";
import { PriceDisplay } from "@/components/ui/price-display";

interface SummaryTotalSectionProps {
  totalPrice: number;
  language: 'en' | 'ar';
}

export const SummaryTotalSection = ({ totalPrice, language }: SummaryTotalSectionProps) => {
  return (
    <div className="border-t pt-3 font-medium flex justify-between">
      <span>{language === 'ar' ? 'المجموع' : 'Total'}</span>
      <motion.div
        key={totalPrice}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        <PriceDisplay 
          price={totalPrice} 
          language={language}
          size="base"
        />
      </motion.div>
    </div>
  );
};
