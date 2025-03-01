
import React from 'react';
import { Slash, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { CustomBadge } from "@/components/ui/custom-badge";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { convertToArabic } from "@/utils/arabicNumerals";

interface UpsellService {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  discountPercentage: number;
  discountedPrice: number;
}

interface UpsellServiceCardProps {
  upsell: UpsellService;
  isSelected: boolean;
  useGridLayout: boolean;
  onToggle: (upsell: UpsellService) => void;
}

export const UpsellServiceCard = ({
  upsell,
  isSelected,
  useGridLayout,
  onToggle
}: UpsellServiceCardProps) => {
  const { language } = useLanguage();

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    const formattedNumber = language === 'ar' ? convertToArabic(roundedPrice.toString()) : roundedPrice.toString();
    return <span className="inline-flex items-center gap-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {formattedNumber}
        <RiyalIcon />
      </span>;
  };

  return (
    <motion.div 
      key={upsell.id} 
      variants={{
        hidden: {
          y: 20,
          opacity: 0
        },
        visible: {
          y: 0,
          opacity: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
          }
        }
      }} 
      whileHover={{
        scale: 1.02
      }} 
      whileTap={{
        scale: 0.98
      }} 
      className={`p-3 border rounded-lg cursor-pointer transition-all relative ${isSelected ? 'border-[#b4d98b] bg-[#F2FCE2]/30 shadow-md ring-2 ring-[#b4d98b]' : 'hover:border-[#e7bd71]/50 hover:shadow-sm'}`} 
      onClick={() => onToggle(upsell)}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            className="absolute top-1 right-1" 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <CheckCircle2 className="w-5 h-5 text-[#b4d98b]" />
          </motion.div>
        )}
      </AnimatePresence>
        
      <div className="flex flex-col gap-1.5 relative">
        <div>
          <h3 className={`font-medium ${useGridLayout ? 'text-sm' : 'text-base'} ${isSelected ? 'text-[#5f7b3e]' : ''} line-clamp-2 pr-6`}>
            {language === 'ar' ? upsell.name_ar : upsell.name_en}
          </h3>
          <p className="text-xs text-muted-foreground">
            {upsell.duration} {language === 'ar' ? 'د' : 'min'}
          </p>
        </div>
        
        <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
          <div className="flex items-center gap-1.5 justify-end">
            <span className="flex items-center relative">
              <Slash className="w-3.5 h-3.5 text-destructive absolute -translate-y-[2px]" />
              <span className="text-sm text-muted-foreground line-through">{formatPrice(upsell.price)}</span>
            </span>
            <motion.span 
              className="text-sm font-medium" 
              animate={isSelected ? {
                scale: [1, 1.1, 1]
              } : {}} 
              transition={{
                duration: 0.3
              }}
            >
              {formatPrice(upsell.discountedPrice)}
            </motion.span>
          </div>
          <div className="flex justify-end mt-1">
            <CustomBadge variant="discount" className="py-0.5 px-2 text-[10px]">
              -{upsell.discountPercentage}%
            </CustomBadge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
