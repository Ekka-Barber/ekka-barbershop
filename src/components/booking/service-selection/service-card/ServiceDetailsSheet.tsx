
import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/utils/formatters";
import { PriceDisplay } from "@/components/ui/price-display";
import { Service } from "@/types/service";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";

interface ServiceDetailsSheetProps {
  service: Service;
  isSelected: boolean;
  serviceName: string;
  serviceDescription: string;
  finalPrice: number;
  hasDiscount: boolean;
  language: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSelect: (service: Service) => void;
}

export const ServiceDetailsSheet = ({
  service,
  isSelected,
  serviceName,
  serviceDescription,
  finalPrice,
  hasDiscount,
  language,
  isOpen,
  setIsOpen,
  onSelect,
}: ServiceDetailsSheetProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side="bottom" 
        className={`${language === 'ar' ? 'rtl' : 'ltr'} font-changa p-0`}
      >
        <div className="rounded-t-xl border-t-2 border-[#C4A484] bg-white max-h-[85vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex flex-col space-y-2 text-center">
              <SheetTitle className="text-2xl font-bold">{serviceName}</SheetTitle>
              {serviceDescription && (
                <div className="text-base text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {serviceDescription}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {formatDuration(service.duration, language)}
                </div>
                <div className="space-y-1 text-right">
                  {hasDiscount && (
                    <PriceDisplay 
                      price={service.price}
                      language={language}
                      showDiscount={true}
                      className="text-sm text-muted-foreground decoration-[#ea384c] line-through"
                    />
                  )}
                  <PriceDisplay 
                    price={finalPrice}
                    language={language}
                    size="lg"
                    className={cn(
                      "font-semibold",
                      hasDiscount && "text-[#ea384c]"
                    )}
                  />
                </div>
              </div>

              <Button
                onClick={() => {
                  onSelect(service);
                  setIsOpen(false);
                }}
                variant="outline"
                className={cn(
                  "w-full mt-4 transition-colors duration-300",
                  isSelected ? "border-red-500 text-red-500 hover:bg-red-50" : "border-green-500 text-green-500 hover:bg-green-50"
                )}
              >
                {isSelected ? (
                  <Minus className="h-4 w-4 mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {isSelected
                  ? language === 'ar'
                    ? 'إزالة'
                    : 'Remove'
                  : language === 'ar'
                  ? 'إضافة'
                  : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
