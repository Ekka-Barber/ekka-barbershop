
import { Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertToArabic } from "@/utils/arabicNumerals";
import { formatDuration } from "@/utils/formatters";
import { PriceDisplay } from "@/components/ui/price-display";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ServicesSummaryProps {
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  language: string;
  onNextStep: () => void;
}

export const ServicesSummary = ({
  selectedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep
}: ServicesSummaryProps) => {
  if (selectedServices.length === 0) return null;

  const servicesCount = language === 'ar' 
    ? `${convertToArabic(selectedServices.length.toString())} خدمات`
    : `${selectedServices.length} services`;

  const MetricsGroup = () => (
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
          {formatDuration(totalDuration, language as 'en' | 'ar')}
        </motion.span>
      </span>
      <span className="text-gray-500">•</span>
      <motion.div
        key={totalPrice}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <PriceDisplay price={totalPrice} language={language as 'en' | 'ar'} size="base" />
      </motion.div>
    </div>
  );

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <MetricsGroup />
            <Button 
              className={cn(
                "bg-[#e7bd71] hover:bg-[#d4ad65] transition-all duration-300",
                selectedServices.length > 0 && "animate-pulse-once"
              )}
              onClick={onNextStep}
              disabled={selectedServices.length === 0}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
