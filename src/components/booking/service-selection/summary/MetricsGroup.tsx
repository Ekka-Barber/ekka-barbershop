
import { Timer } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/utils/formatters";
import { PriceDisplay } from "@/components/ui/price-display";
import { convertToArabic } from "@/utils/arabicNumerals";

interface MetricsGroupProps {
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  language: 'en' | 'ar';
}

export const MetricsGroup = ({
  selectedServices,
  totalDuration,
  totalPrice,
  language
}: MetricsGroupProps) => {
  const servicesCount = language === 'ar' 
    ? `${convertToArabic(selectedServices.length.toString())} خدمات`
    : `${selectedServices.length} services`;

  return (
    <div className="flex items-center gap-4">
      <motion.span 
        className="font-medium"
        key={selectedServices.length}
        initial={{ scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {servicesCount}
      </motion.span>
      <span className="text-gray-500">•</span>
      <span className="flex items-center gap-1">
        <Timer className="w-4 h-4" />
        <motion.span
          key={totalDuration}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatDuration(totalDuration, language)}
        </motion.span>
      </span>
      <span className="text-gray-500">•</span>
      <motion.div
        key={totalPrice}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PriceDisplay price={totalPrice} language={language} size="base" />
      </motion.div>
    </div>
  );
};
