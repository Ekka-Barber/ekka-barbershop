
import { motion, AnimatePresence } from "framer-motion";
import { MetricsGroup } from "./summary/MetricsGroup";
import { ActionButton } from "./summary/ActionButton";

interface ServicesSummaryProps {
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  language: 'en' | 'ar';
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

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full max-w-screen-xl mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between">
            <MetricsGroup 
              selectedServices={selectedServices}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              language={language}
            />
            <ActionButton 
              onNextStep={onNextStep}
              isDisabled={selectedServices.length === 0}
              language={language}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
