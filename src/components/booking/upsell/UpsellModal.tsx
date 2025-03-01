
import React, { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { UpsellServiceCard } from "./UpsellServiceCard";
import { UpsellModalHeader } from "./UpsellModalHeader";
import { UpsellModalFooter } from "./UpsellModalFooter";

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
  const { language } = useLanguage();
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
    setTimeout(() => {
      onConfirm(selectedUpsells);
      setIsLoading(false);
      onClose();
    }, 600);
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

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[85vh] sm:h-auto max-h-[85vh] gap-0 p-0 rounded-xl overflow-hidden">
        <UpsellModalHeader />

        <div className="px-6 py-2">
          <p className="text-center text-muted-foreground text-sm">
            {language === 'ar' 
              ? 'اختر من الخدمات الإضافية التالية ما تحب بسعر مخفض' 
              : 'Select from the following additional services at discounted prices'}
          </p>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <ScrollArea className="flex-1">
            <div className="h-full flex items-center justify-center px-6 py-4 min-h-[200px]">
              <motion.div 
                variants={containerVariants} 
                initial="hidden" 
                animate="visible" 
                className={`${useGridLayout ? 'grid grid-cols-2 gap-3 w-full max-w-[450px]' : 'flex flex-col gap-3 w-full max-w-[400px]'}`} 
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {availableUpsells.map((upsell) => {
                  const isSelected = selectedUpsells.some(s => s.id === upsell.id);
                  return (
                    <UpsellServiceCard
                      key={upsell.id}
                      upsell={upsell}
                      isSelected={isSelected}
                      useGridLayout={useGridLayout}
                      onToggle={handleToggleUpsell}
                    />
                  );
                })}
              </motion.div>
            </div>
          </ScrollArea>

          <UpsellModalFooter 
            isLoading={isLoading}
            onConfirm={handleConfirm}
            onClose={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
