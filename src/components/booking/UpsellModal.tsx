
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectedService } from '@/types/service';
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
  availableUpsells,
}: UpsellModalProps) => {
  const { language } = useLanguage();
  const [selectedUpsells, setSelectedUpsells] = React.useState<UpsellService[]>([]);

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

  const formatPrice = (price: number) => {
    const roundedPrice = Math.round(price);
    const formattedNumber = language === 'ar' 
      ? convertToArabic(roundedPrice.toString())
      : roundedPrice.toString();
    
    return (
      <span className="inline-flex items-center gap-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {formattedNumber}
        <RiyalIcon />
      </span>
    );
  };

  const useGridLayout = availableUpsells.length > 3;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col h-[85vh] sm:h-auto max-h-[85vh] gap-0 p-0">
        <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10">
          <DialogTitle className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-xl font-bold">
              {language === 'ar' ? (
                <>
                  <span>🚀</span>
                  <span>عروض حصرية لك</span>
                  <span>🚀</span>
                </>
              ) : (
                'Special Offers Available!'
              )}
            </div>
            {language === 'ar' && (
              <div className="flex items-center justify-center gap-2 text-base font-bold">
                <span>🔥</span>
                <span>اجعل تجربتك أفضل بأقل سعر</span>
                <span>🔥</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

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
              <div 
                className={`${useGridLayout ? 'grid grid-cols-2 gap-2.5 w-full max-w-[450px]' : 'flex flex-col gap-2.5 w-full max-w-[400px]'}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {availableUpsells.map((upsell) => {
                  const isSelected = selectedUpsells.some(s => s.id === upsell.id);

                  return (
                    <div
                      key={upsell.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5 shadow-sm' 
                          : 'hover:border-primary/50 hover:shadow-sm'
                      }`}
                      onClick={() => handleToggleUpsell(upsell)}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div>
                          <h3 className={`font-medium ${useGridLayout ? 'text-sm' : 'text-base'} line-clamp-2`}>
                            {language === 'ar' ? upsell.name_ar : upsell.name_en}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {upsell.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                          </p>
                        </div>
                        <div className={`text-${language === 'ar' ? 'left' : 'right'}`}>
                          <div className="flex items-center gap-1.5 justify-end">
                            <span className="flex items-center relative">
                              <Slash className="w-3.5 h-3.5 text-destructive absolute -translate-y-[2px]" />
                              <span className="text-sm text-muted-foreground">{formatPrice(upsell.price)}</span>
                            </span>
                            <span className="text-sm font-medium">{formatPrice(upsell.discountedPrice)}</span>
                          </div>
                          <p className="text-xs text-destructive font-medium">
                            -{upsell.discountPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>

          <div className="flex flex-col gap-3 p-4 border-t bg-background">
            <Button
              className="bg-[#C4A36F] hover:bg-[#B39260] h-11 text-base font-medium"
              onClick={() => {
                onConfirm(selectedUpsells);
                onClose();
              }}
            >
              {language === 'ar' ? 'تأكيد' : 'Confirm'}
            </Button>
            <button
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === 'ar' ? 'تخطي' : 'Skip'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
