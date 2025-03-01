
import { Timer } from "lucide-react";
import { motion } from "framer-motion";
import { formatDuration } from "@/utils/formatters";
import { PriceDisplay } from "@/components/ui/price-display";
import { convertToArabic } from "@/utils/arabicNumerals";
import { Separator } from "@/components/ui/separator";

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
    <div className="flex items-center gap-3 text-sm">
      <motion.span 
        className="font-medium"
        key={selectedServices.length}
        initial={{ scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {servicesCount}
      </motion.span>
      
      <Separator orientation="vertical" className="h-4 bg-gray-300" />
      
      <span className="flex items-center gap-1">
        <Timer className="w-3.5 h-3.5 text-gray-500" />
        <motion.span
          key={totalDuration}
          initial={{ y: -5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {formatDuration(totalDuration, language)}
        </motion.span>
      </span>
      
      <Separator orientation="vertical" className="h-4 bg-gray-300" />
      
      <motion.div
        key={totalPrice}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="font-medium"
      >
        <PriceDisplay price={totalPrice} language={language} size="base" />
      </motion.div>
    </div>
  );
};
