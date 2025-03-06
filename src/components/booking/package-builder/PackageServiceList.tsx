
import React from 'react';
import { Service } from '@/types/service';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PlusCircle, CheckCircle } from "lucide-react";

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
              <button 
                key={service.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-md w-full transition-all duration-200 mb-1",
                  isSelected 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/70 border border-transparent"
                )}
                onClick={() => onToggleService(service)}
              >
                <div className="flex items-center gap-3 rtl:flex-row-reverse flex-1 min-w-0">
                  <div className="shrink-0 text-primary">
                    {isSelected ? (
                      <CheckCircle className="h-5 w-5 text-[#C4A484] transition-transform duration-200" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
                    )}
                  </div>
                  <span className="text-sm font-medium leading-tight truncate">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </span>
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
                    <span className={cn(isSelected ? "font-medium" : "")}>
                      {language === 'ar' ? `${service.price} ر.س` : `SAR ${service.price}`}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
