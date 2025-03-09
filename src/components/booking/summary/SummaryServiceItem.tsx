
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SelectedService } from "@/types/service";
import { PriceDisplay } from "@/components/ui/price-display";
import { cn } from "@/lib/utils";
import { CustomBadge } from "@/components/ui/custom-badge";

interface SummaryServiceItemProps {
  service: SelectedService;
  language: 'en' | 'ar';
  onRemove?: (service: SelectedService) => void;
  baseServiceId?: string;
}

export const SummaryServiceItem = ({
  service,
  language,
  onRemove,
  baseServiceId
}: SummaryServiceItemProps) => {
  return (
    <motion.div 
      key={service.id} 
      className="flex justify-between items-center py-2 group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        {onRemove && (service.isPackageAddOn || service.isUpsellItem) && (
          <motion.button
            onClick={() => onRemove(service)}
            className={cn(
              "p-1 hover:bg-gray-100 rounded-full transition-colors",
              service.isUpsellItem ? "opacity-0 group-hover:opacity-100" : "opacity-70 group-hover:opacity-100"
            )}
            aria-label="Remove service"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-4 h-4 text-red-500" />
          </motion.button>
        )}
        <span>{language === 'ar' ? service.name_ar : service.name_en}</span>
        {service.id === baseServiceId && (
          <CustomBadge variant="success" className="text-[0.65rem] px-1 py-0">
            {language === 'ar' ? 'أساسي' : 'BASE'}
          </CustomBadge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {service.originalPrice && service.originalPrice > service.price && (
          <PriceDisplay 
            price={service.originalPrice} 
            language={language} 
            size="sm"
            className="text-[#ea384c] line-through"
          />
        )}
        <PriceDisplay 
          price={service.price} 
          language={language} 
          size="sm"
        />
      </div>
    </motion.div>
  );
};
