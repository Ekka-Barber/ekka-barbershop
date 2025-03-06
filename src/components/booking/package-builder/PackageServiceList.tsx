
import React from 'react';
import { Service } from '@/types/service';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PriceDisplay } from "@/components/ui/price-display";

interface PackageServiceListProps {
  services: Service[];
  selectedServices: Service[];
  onToggleService: (service: Service) => void;
  discountPercentage: number;
  language: string;
}

export const PackageServiceList = ({
  services,
  selectedServices,
  onToggleService,
  discountPercentage,
  language
}: PackageServiceListProps) => {
  if (services.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        {language === 'ar' ? 'لا توجد خدمات متاحة للباقة' : 'No services available for package'}
      </div>
    );
  }
  
  const calculateDiscountedPrice = (price: number) => {
    return Math.floor(price * (1 - discountPercentage / 100));
  };
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {language === 'ar' ? 'الخدمات الإضافية' : 'Add-on Services'}
        {discountPercentage > 0 && (
          <span className="text-green-600 ml-2">
            ({discountPercentage}% {language === 'ar' ? 'خصم' : 'off'})
          </span>
        )}
      </h3>
      
      <ScrollArea className="h-48 rounded-md border">
        <div className="px-3 py-2">
          {services.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            const discountedPrice = calculateDiscountedPrice(service.price);
            
            return (
              <div 
                key={service.id} 
                className={`flex items-center justify-between p-2.5 rounded-md ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'} transition-colors duration-150`}
              >
                <div className="flex items-center gap-3 rtl:flex-row-reverse flex-1 min-w-0">
                  <Checkbox
                    id={`service-${service.id}`}
                    checked={isSelected}
                    onCheckedChange={() => onToggleService(service)}
                    className="shrink-0"
                  />
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium cursor-pointer leading-tight truncate peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </label>
                </div>
                
                <div className="text-sm whitespace-nowrap rtl:text-left">
                  {isSelected && discountPercentage > 0 ? (
                    <div className="flex flex-col items-end rtl:items-start">
                      <span className="line-through text-muted-foreground text-xs">
                        {language === 'ar' ? `${service.price} ر.س` : `SAR ${service.price}`}
                      </span>
                      <span className="text-green-600 font-medium">
                        {language === 'ar' ? `${discountedPrice} ر.س` : `SAR ${discountedPrice}`}
                      </span>
                    </div>
                  ) : (
                    <span>
                      {language === 'ar' ? `${service.price} ر.س` : `SAR ${service.price}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
