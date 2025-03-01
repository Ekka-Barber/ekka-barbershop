
import * as React from "react";
import { Service } from "@/types/service";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { ServiceCardBase } from "./service-card/ServiceCardBase";
import { ServiceCardHeader } from "./service-card/ServiceCardHeader";
import { ServiceCardActions } from "./service-card/ServiceCardActions";
import { ServiceCardPrice } from "./service-card/ServiceCardPrice";
import { ServiceDetailsSheet } from "./service-card/ServiceDetailsSheet";
import { calculateDiscount } from "./service-card/calculateDiscount";

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
  const [isSelecting, setIsSelecting] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelecting(true);
    // Small delay to allow animation to complete
    setTimeout(() => {
      onSelect(service);
      setIsSelecting(false);
    }, 150);
  };

  const discount = calculateDiscount(
    service.price, 
    service.discount_type, 
    service.discount_value
  );
  
  const hasDiscount = !!discount;
  const finalPrice = hasDiscount ? discount.finalPrice : service.price;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <ServiceCardBase
          isSelected={isSelected}
          isSelecting={isSelecting}
          hasDiscount={hasDiscount}
          discountPercentage={discount?.percentage}
          onClick={() => setIsOpen(true)}
          className={className}
        >
          <div className="flex flex-col h-full">
            <ServiceCardHeader 
              serviceName={serviceName} 
              duration={service.duration}
              language={language}
            />
            
            <div className="mt-auto flex items-end pt-4">
              <ServiceCardActions 
                isSelected={isSelected} 
                onSelect={handleSelect}
              />
              <ServiceCardPrice 
                price={service.price}
                finalPrice={finalPrice}
                hasDiscount={hasDiscount}
                language={language}
              />
            </div>
          </div>
        </ServiceCardBase>
      </SheetTrigger>

      <ServiceDetailsSheet
        service={service}
        isSelected={isSelected}
        serviceName={serviceName}
        serviceDescription={serviceDescription}
        finalPrice={finalPrice}
        hasDiscount={hasDiscount}
        language={language}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSelect={onSelect}
      />
    </Sheet>
  );
};
