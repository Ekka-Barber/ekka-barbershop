
import React from 'react';
import { Service } from '@/types/service';
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { formatNumber } from "@/utils/priceFormatting";

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
  
  // Sort services by their display_order if they have that property
  const sortedServices = [...services].sort((a: any, b: any) => {
    // If both services have display_order property, sort by it
    if (a.display_order !== undefined && b.display_order !== undefined) {
      return a.display_order - b.display_order;
    }
    // If only one has display_order, prioritize it
    if (a.display_order !== undefined) return -1;
    if (b.display_order !== undefined) return 1;
    // Fall back to name
    return (language === 'ar' ? 
      a.name_ar.localeCompare(b.name_ar) : 
      a.name_en.localeCompare(b.name_en));
  });
  
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {language === 'ar' ? 'الخدمات الإضافية' : 'Add-on Services'}
        {discountPercentage > 0 && (
          <span className="text-green-600 mx-2">
            ({discountPercentage}% {language === 'ar' ? 'خصم' : 'off'})
          </span>
        )}
      </h3>
      
      <ScrollArea className="h-48 rounded-md border">
        <div className="px-3 py-2">
          {sortedServices.map((service) => {
            const isSelected = selectedServices.some(s => s.id === service.id);
            const discountedPrice = calculateDiscountedPrice(service.price);
            
            return (
              <button 
                key={service.id} 
                className={cn(
                  "flex items-center justify-between p-3 rounded-md w-full transition-all duration-200 mb-1 relative",
                  isSelected 
                    ? "bg-primary/10 border border-primary/20" 
                    : "hover:bg-muted/70 border border-transparent"
                )}
                onClick={() => onToggleService(service)}
              >
                {isSelected && (
                  <div className={cn(
                    "absolute -top-1.5 -right-1.5",
                    language === 'ar' && "-top-1.5 -left-1.5 right-auto"
                  )}>
                    <CheckCircle className="h-4 w-4 text-[#C4A484]" />
                  </div>
                )}
                
                {/* Price display - moved to the left side */}
                <div className={cn(
                  "whitespace-nowrap",
                  language === 'ar' ? "text-right" : "text-left"
                )}>
                  {isSelected && discountPercentage > 0 ? (
                    <div className={cn(
                      "flex flex-col",
                      language === 'ar' ? "items-end" : "items-start"
                    )}>
                      <span className="line-through text-muted-foreground text-xs">
                        {formatNumber(service.price, language as 'en' | 'ar')}
                      </span>
                      <span className="text-green-600 font-medium">
                        {formatNumber(discountedPrice, language as 'en' | 'ar')}
                      </span>
                    </div>
                  ) : (
                    <span className={isSelected ? "font-medium" : ""}>
                      {formatNumber(service.price, language as 'en' | 'ar')}
                    </span>
                  )}
                </div>
                
                {/* Service name - now on the right side */}
                <div className={cn(
                  "flex items-center gap-3 flex-1 min-w-0",
                  language === 'ar' ? "flex-row-reverse text-right" : "flex-row text-left"
                )}>
                  <span className="text-sm font-medium leading-tight truncate">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
