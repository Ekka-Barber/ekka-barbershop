
import { motion, AnimatePresence } from "framer-motion";
import { MetricsGroup } from "./summary/MetricsGroup";
import { ActionButton } from "./summary/ActionButton";
import { useMemo } from "react";
import { PackageSavingsDrawer } from "./summary/PackageSavingsDrawer";
import { PackageSettings } from "@/types/admin";
import { Service, SelectedService } from '@/types/service';

interface ServicesSummaryProps {
  selectedServices: Array<{
    id: string;
    name: string;
    price: number;
    duration: number;
    originalPrice?: number;
  }>;
  totalDuration: number;
  totalPrice: number;
  language: 'en' | 'ar';
  onNextStep: () => void;
  onPrevStep: () => void;
  isFirstStep: boolean;
  packageEnabled?: boolean;
  packageSettings?: PackageSettings;
  availableServices?: Service[];
  onAddService?: (service: Service) => void;
  isValidating?: boolean;
  hasBaseService?: boolean;
  packageSavings?: number;
}

export const ServicesSummary = ({
  selectedServices,
  totalDuration,
  totalPrice,
  language,
  onNextStep,
  onPrevStep,
  isFirstStep,
  packageEnabled = false,
  packageSettings,
  availableServices = [],
  onAddService,
  isValidating = false,
  hasBaseService = false,
  packageSavings = 0
}: ServicesSummaryProps) => {
  // Use memoization to prevent unnecessary recalculations
  const shouldDisplay = useMemo(() => selectedServices.length > 0, [selectedServices.length]);
  
  if (!shouldDisplay) return null;

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
            {/* Previous button on the left */}
            <ActionButton 
              onClick={onPrevStep}
              direction="prev"
              language={language}
              isDisabled={isFirstStep}
            />
            
            {/* Metrics in the center */}
            <MetricsGroup 
              selectedServices={selectedServices}
              totalDuration={totalDuration}
              totalPrice={totalPrice}
              language={language}
            />
            
            {/* Next button on the right */}
            <ActionButton 
              onClick={onNextStep}
              direction="next"
              language={language}
              isDisabled={selectedServices.length === 0 || isValidating}
              isLoading={isValidating}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
