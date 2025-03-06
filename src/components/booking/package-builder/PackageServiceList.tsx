
import React from 'react';
import { Service } from '@/types/service';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
        <div className="p-4 space-y-3">
          {services.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            const discountedPrice = calculateDiscountedPrice(service.price);
            
            return (
              <div key={service.id} className="flex items-center space-x-3 rtl:space-x-reverse">
                <Checkbox
                  id={`service-${service.id}`}
                  checked={isSelected}
                  onCheckedChange={() => onToggleService(service)}
                />
                <div className="flex justify-between items-center w-full">
                  <label
                    htmlFor={`service-${service.id}`}
                    className="text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </label>
                  <div className="text-sm">
                    {isSelected && discountPercentage > 0 ? (
                      <div className="text-right">
                        <span className="line-through text-muted-foreground text-xs mr-1">
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
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
