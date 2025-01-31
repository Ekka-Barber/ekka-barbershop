import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UpsellService {
  id: string;
  name: string;
  price: number;
  duration: number;
  discountPercentage: number;
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

  const calculateDiscountedPrice = (price: number, discountPercentage: number) => {
    return price - (price * (discountPercentage / 100));
  };

  const formatPrice = (price: number) => {
    return `${Math.round(price)} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const useGridLayout = availableUpsells.length > 3;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] flex flex-col max-h-[80vh]">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-center text-lg font-bold mb-4 whitespace-pre-line leading-relaxed">
            {language === 'ar' 
              ? "🚀 عروض حصرية لك 🚀\n🔥 اجعل تجربتك أفضل بأقل سعر 🔥"
              : 'Special Offers Available!'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full max-h-[50vh] px-6">
            <p className="text-center text-muted-foreground text-sm mb-4">
              {language === 'ar'
                ? 'اختر من الخدمات الإضافية التالية ما تحب بسعر مخفض'
                : 'Select from the following additional services at discounted prices'}
            </p>
            <div className={`${useGridLayout ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
              {availableUpsells.map((upsell) => {
                const isSelected = selectedUpsells.some(s => s.id === upsell.id);
                const discountedPrice = calculateDiscountedPrice(upsell.price, upsell.discountPercentage);

                return (
                  <div
                    key={upsell.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    }`}
                    onClick={() => handleToggleUpsell(upsell)}
                  >
                    <div className="flex flex-col gap-2">
                      <div>
                        <h3 className="font-medium line-clamp-2">{upsell.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {upsell.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="flex items-center relative">
                            <Slash className="w-4 h-4 text-destructive absolute -translate-y-[2px]" />
                            <span className="text-muted-foreground">{formatPrice(upsell.price)}</span>
                          </span>
                          <span className="font-medium">{formatPrice(discountedPrice)}</span>
                        </div>
                        <p className="text-sm text-destructive">
                          -{upsell.discountPercentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <div className="flex flex-col gap-3 mt-4 px-6 pt-4 border-t">
          <Button
            className="bg-[#C4A36F] hover:bg-[#B39260] h-12 text-lg font-medium"
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
      </DialogContent>
    </Dialog>
  );
};