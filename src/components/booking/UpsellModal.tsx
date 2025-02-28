
import { Fragment, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Check, X } from "lucide-react";

interface UpsellModalProps {
  isOpen: boolean;
  availableUpsells: any[];
  selectedServices: any[];
  onClose: () => void;
  onConfirm: (selectedUpsells: any[]) => void;
}

export const UpsellModal = ({
  isOpen,
  availableUpsells,
  selectedServices,
  onClose,
  onConfirm
}: UpsellModalProps) => {
  const { language, t } = useLanguage();
  const [selectedUpsells, setSelectedUpsells] = useState<any[]>([]);

  // Reset selected upsells when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setSelectedUpsells([]);
    }
  };

  const toggleUpsell = (upsell: any) => {
    setSelectedUpsells(prev => {
      const isSelected = prev.some(s => s.id === upsell.id);
      if (isSelected) {
        return prev.filter(s => s.id !== upsell.id);
      } else {
        return [...prev, upsell];
      }
    });
  };

  const isUpsellAlreadyInCart = (upsellId: string) => {
    return selectedServices.some(service => service.id === upsellId);
  };

  const handleConfirm = () => {
    onConfirm(selectedUpsells);
    onClose();
  };

  if (!availableUpsells?.length) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl mb-4">
            {language === 'ar' ? 'خدمات إضافية بخصم خاص' : 'Special Discounted Add-ons'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {availableUpsells.map(upsell => {
            const alreadyInCart = isUpsellAlreadyInCart(upsell.id);
            const isSelected = selectedUpsells.some(s => s.id === upsell.id) || alreadyInCart;
            
            return (
              <div 
                key={upsell.id}
                className={`border rounded-lg p-4 ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200'} cursor-pointer transition-colors`}
                onClick={() => !alreadyInCart && toggleUpsell(upsell)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {language === 'ar' ? upsell.name_ar : upsell.name_en}
                    </h3>
                    <div className="flex items-center mt-1 text-sm">
                      <span className="line-through text-gray-500 mr-2">
                        {upsell.price} SAR
                      </span>
                      <span className="text-green-600 font-medium">
                        {upsell.discountedPrice} SAR
                      </span>
                      <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                        {upsell.discountPercentage}% {language === 'ar' ? 'خصم' : 'OFF'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>
                    )}
                  </div>
                </div>
                {alreadyInCart && (
                  <p className="text-xs text-gray-500 mt-2">
                    {language === 'ar' ? 'تمت إضافتها بالفعل' : 'Already added'}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex space-x-2 justify-end mt-4 rtl:space-x-reverse">
          <Button variant="outline" onClick={onClose}>
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
          <Button 
            className="bg-[#C4A36F] hover:bg-[#B39260]"
            onClick={handleConfirm}
            disabled={selectedUpsells.length === 0}
          >
            {language === 'ar' ? 'إضافة' : 'Add Selected'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
