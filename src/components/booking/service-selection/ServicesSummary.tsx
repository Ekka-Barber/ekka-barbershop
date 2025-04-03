
import { motion, AnimatePresence } from "framer-motion";
import { MetricsGroup } from "./summary/MetricsGroup";
import { ActionButton } from "./summary/ActionButton";
import { useMemo } from "react";
import { PackageSavingsDrawer } from "./summary/PackageSavingsDrawer";
import { PackageSettings } from "@/types/admin";
import { Service } from '@/types/service';

interface ServiceDisplayItem {
  id: string;
  name: string;
  price: number;
  duration: number;
  originalPrice?: number;
  isBasePackageService?: boolean;
  isPackageAddOn?: boolean;
}

interface ServicesSummaryProps {
  selectedServices: ServiceDisplayItem[];
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
        className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-40 pb-safe"
        style={{ 
          paddingBottom: `max(env(safe-area-inset-bottom, 0.5rem), 0.5rem)`,
          WebkitBackdropFilter: 'blur(8px)'
        }}
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
