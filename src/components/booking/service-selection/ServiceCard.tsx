
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Service } from "@/types/service";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDuration } from "@/utils/formatters";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus, Minus } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";
import { CustomBadge } from "@/components/ui/custom-badge";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
  className?: string;
}

export const ServiceCard = ({ service, isSelected, onSelect, className }: ServiceCardProps) => {
  const { language } = useLanguage();
  const serviceName = language === 'ar' ? service.name_ar : service.name_en;
  const serviceDescription = language === 'ar' ? service.description_ar : service.description_en;
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(service);
  };

  const calculateDiscount = () => {
    if (!service.discount_type || !service.discount_value) return null;
    
    if (service.discount_type === 'percentage') {
      return {
        percentage: service.discount_value,
        finalPrice: service.price * (1 - service.discount_value/100)
      };
    }
    
    // If discount is amount-based, calculate percentage
    const percentage = Math.round((service.discount_value / service.price) * 100);
    return {
      percentage,
      finalPrice: service.price - service.discount_value
    };
  };

  const discount = calculateDiscount();
  const hasDiscount = !!discount;
  const finalPrice = hasDiscount ? discount.finalPrice : service.price;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Card
          className={cn(
            "relative overflow-visible cursor-pointer transition-all p-4",
            isSelected ? "border-[#C4A484] bg-[#C4A484]/5" : "hover:border-[#C4A484]/50",
            className
          )}
        >
          {hasDiscount && (
            <div className="absolute -top-3 -left-3">
              <CustomBadge
                variant="discount"
                className="z-20"
              >
                -{discount.percentage}%
              </CustomBadge>
            </div>
          )}
          <div className="flex flex-col h-full">
            <div>
              <h3 className="font-medium text-base mb-2">{serviceName}</h3>
              <div className="text-sm text-muted-foreground">
                {formatDuration(service.duration, language)}
              </div>
            </div>
            
            <div className="mt-auto flex items-end pt-4">
              <div className="flex-1 flex items-end">
                <Button
                  size="icon"
                  variant="ghost"
                  className={cn(
                    "h-6 w-6 rounded-full transition-all duration-300",
                    isSelected 
                      ? "hover:bg-red-100 text-red-500" 
                      : "hover:bg-green-100 text-green-500"
                  )}
                  onClick={handleSelect}
                >
                  <div className="transition-transform duration-300">
                    {isSelected ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </Button>
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
                  className={cn(
                    "font-semibold",
                    hasDiscount && "text-[#ea384c]"
                  )}
                />
              </div>
            </div>
          </div>
        </Card>
      </SheetTrigger>

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
