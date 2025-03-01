
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slash, Gift, CheckCircle2, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectedService } from '@/types/service';
import RiyalIcon from "@/components/icons/RiyalIcon";
import { convertToArabic } from "@/utils/arabicNumerals";
import { CustomBadge } from "@/components/ui/custom-badge";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
interface UpsellService {
  id: string;
  name_en: string;
  name_ar: string;
  price: number;
  duration: number;
  discountPercentage: number;
  discountedPrice: number;
}
interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedUpsells: UpsellService[]) => void;
  availableUpsells: UpsellService[];
}
export const UpsellModal = ({
  isOpen,
  onClose,
  onConfirm,
  availableUpsells
}: UpsellModalProps) => {
  const {
    language
  } = useLanguage();
  const [selectedUpsells, setSelectedUpsells] = useState<UpsellService[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleToggleUpsell = (upsell: UpsellService) => {
    setSelectedUpsells(prev => {
      const isSelected = prev.some(s => s.id === upsell.id);
      if (isSelected) {
        return prev.filter(s => s.id !== upsell.id);
      } else {
        return [...prev, upsell];
      }
    });
  };
  const handleConfirm = () => {
    setIsLoading(true);
    // Simulate a small delay for the loading animation
    setTimeout(() => {
      onConfirm(selectedUpsells);
      setIsLoading(false);
      onClose();
    }, 600);
  };
  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    const formattedNumber = language === 'ar' ? convertToArabic(roundedPrice.toString()) : roundedPrice.toString();
    return <span className="inline-flex items-center gap-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {formattedNumber}
        <RiyalIcon />
      </span>;
  };
  const useGridLayout = availableUpsells.length > 3;
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const itemVariants = {
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
  };
  return <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[85vh] sm:h-auto max-h-[85vh] gap-0 p-0 rounded-xl overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b border-border/30">
          <DialogTitle className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xl font-bold">
              {language === 'ar' ? <>
                  <Gift className="text-[#e7bd71] animate-pulse" />
                  <span>عروض حصرية لك</span>
                  <Gift className="text-[#e7bd71] animate-pulse" />
                </> : <>
                  <Gift className="text-[#e7bd71] animate-pulse" />
                  <span>Special Offers Available!</span>
                  <Gift className="text-[#e7bd71] animate-pulse" />
                </>}
            </div>
            {language === 'ar' && <div className="flex items-center justify-center gap-2 text-base font-bold">
                <span className="text-[#e7bd71]">🔥</span>
                <span>اجعل تجربتك أفضل بأقل سعر</span>
                <span className="text-[#e7bd71]">🔥</span>
              </div>}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2">
          <p className="text-center text-muted-foreground text-sm">
            {language === 'ar' ? 'اختر من الخدمات الإضافية التالية ما تحب بسعر مخفض' : 'Select from the following additional services at discounted prices'}
          </p>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="h-full flex items-center justify-center px-6 py-4 min-h-[200px]">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`${useGridLayout ? 'grid grid-cols-2 gap-3 w-full max-w-[450px]' : 'flex flex-col gap-3 w-full max-w-[400px]'}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {availableUpsells.map((upsell, index) => {
                const isSelected = selectedUpsells.some(s => s.id === upsell.id);
                return <motion.div key={upsell.id} variants={itemVariants} whileHover={{
                  scale: 1.02
                }} whileTap={{
                  scale: 0.98
                }} className={`p-3 border rounded-lg cursor-pointer transition-all relative overflow-hidden ${isSelected ? 'border-[#e7bd71] bg-[#F2FCE2]/30 shadow-md' : 'hover:border-[#e7bd71]/50 hover:shadow-sm'}`} onClick={() => handleToggleUpsell(upsell)}>
                      <div className="flex flex-col gap-1.5 relative">
                        <div>
                          <h3 className={`font-medium ${useGridLayout ? 'text-sm' : 'text-base'} line-clamp-2`}>
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
                            <motion.span className="text-sm font-medium" animate={isSelected ? {
                          scale: [1, 1.1, 1]
                        } : {}} transition={{
                          duration: 0.3
                        }}>
                              {formatPrice(upsell.discountedPrice)}
                            </motion.span>
                          </div>
                          <div className="flex justify-end mt-1">
                            <CustomBadge variant="discount" className="py-0.5 px-2 text-[10px]">
                              -{upsell.discountPercentage}%
                            </CustomBadge>
                          </div>
                        </div>
                        
                        {/* Green highlight div positioned outside the card */}
                        <AnimatePresence>
                          {isSelected && <motion.div className="absolute -left-3 top-0 h-full" initial={{
                            scale: 0,
                            opacity: 0
                          }} animate={{
                            scale: 1,
                            opacity: 1
                          }} exit={{
                            scale: 0,
                            opacity: 0
                          }} transition={{
                            duration: 0.2
                          }}>
                            <div className="bg-[#b4d98b] h-full w-1.5 rounded-full" />
                          </motion.div>}
                        </AnimatePresence>
                      </div>
                    </motion.div>;
              })}
              </motion.div>
            </div>
          </ScrollArea>

          <div className="flex flex-col gap-3 p-5 border-t bg-background/95 backdrop-blur-sm">
            <Button className="bg-[#e7bd71] hover:bg-[#c4a36f] h-11 text-base font-medium shadow-sm group" onClick={handleConfirm} disabled={isLoading}>
              {isLoading ? <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري التأكيد...' : 'Confirming...'}
                </span> : <span className="flex items-center gap-2">
                  {language === 'ar' ? 'تأكيد' : 'Confirm'}
                </span>}
            </Button>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    {language === 'ar' ? 'تخطي' : 'Skip'}
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{language === 'ar' ? 'تخطي العروض الخاصة' : 'Skip special offers'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};
