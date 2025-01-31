import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Slash } from "lucide-react";

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

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-bold mb-4 px-4 whitespace-pre-line leading-relaxed">
            {language === 'ar' 
              ? "🚀 عروض حصرية لك 🚀\n🔥 اجعل تجربتك أفضل بأقل سعر 🔥"
              : 'Special Offers Available!'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-center text-muted-foreground">
            {language === 'ar'
              ? 'اختر من الخدمات الإضافية التالية ما تحب بسعر مخفض'
              : 'Select from the following additional services at discounted prices'}
          </p>
          <div className="space-y-3">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{upsell.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {upsell.duration} {language === 'ar' ? 'دقيقة' : 'min'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
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
        </div>
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            {language === 'ar' ? 'تخطي' : 'Skip'}
          </Button>
          <Button
            className="flex-1 bg-[#C4A36F] hover:bg-[#B39260]"
            onClick={() => {
              onConfirm(selectedUpsells);
              onClose();
            }}
          >
            {language === 'ar' ? 'تأكيد' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};