
import * as React from "react";
import { Timer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ServiceCardPrice } from "./ServiceCardPrice";
import { formatDuration } from "@/utils/formatters";
import { Service } from "@/types/service";
import { Language } from "@/types/language";

interface ServiceDetailsSheetProps {
  service: Service;
  isSelected: boolean;
  language: Language;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: (service: Service) => void;
  // Add these new props
  serviceName?: string;
  serviceDescription?: string | null;
  finalPrice?: number;
  hasDiscount?: boolean;
}

export const ServiceDetailsSheet = ({
  service,
  isSelected,
  language,
  isOpen,
  setIsOpen,
  onSelect,
  serviceName,
  serviceDescription,
  finalPrice,
  hasDiscount
}: ServiceDetailsSheetProps) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(service);
    setIsOpen(false);
  };

  const onClose = () => setIsOpen(false);
  
  // Use the provided serviceName or derive it from the service
  const displayName = serviceName || (language === 'ar' ? service.name_ar : service.name_en);
  // Use the provided serviceDescription or derive it from the service
  const displayDescription = serviceDescription || (language === 'ar' ? service.description_ar : service.description_en);
  
  return (
    <SheetContent
      side="bottom"
      className="p-0 rounded-t-2xl border-t-0 max-h-[85vh] sm:max-w-full"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-xl font-semibold pr-8">
              {displayName}
            </SheetTitle>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span>{formatDuration(service.duration, language as 'en' | 'ar')}</span>
            </div>
          </SheetHeader>
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {language === 'ar' ? 'السعر' : 'Price'}
          </div>
          {finalPrice !== undefined && hasDiscount !== undefined ? (
            <ServiceCardPrice
              price={service.price}
              finalPrice={finalPrice}
              hasDiscount={hasDiscount}
              language={language}
            />
          ) : (
            <ServiceCardPrice
              price={service.price}
              discountType={service.discount_type}
              discountValue={service.discount_value}
              language={language}
            />
          )}
        </div>

        {displayDescription && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {language === 'ar' ? 'وصف الخدمة' : 'Description'}
            </div>
            <p className="text-sm text-muted-foreground">{displayDescription}</p>
          </div>
        )}

        <Button 
          className="w-full mt-4" 
          onClick={handleSelect}
        >
          {isSelected
            ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
            : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
        </Button>
      </div>
    </SheetContent>
  );
};
