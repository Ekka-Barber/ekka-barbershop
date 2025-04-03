
import { Service } from "@/types/service";
import { Check, Clock, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "@/components/ui/price-display";

interface ServiceOptionsListProps {
  availableServices: Service[];
  selectedAddOns: Service[];
  toggleService: (service: Service) => void;
  calculations: {
    discountPercentage: number;
    originalTotal: number;
    discountedTotal: number;
    savings: number;
  };
  language: string;
}

export const ServiceOptionsList = ({
  availableServices,
  selectedAddOns,
  toggleService,
  calculations,
  language
}: ServiceOptionsListProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">
        {language === 'ar' ? "الخدمات الإضافية" : "Add-on Services"}
      </h3>
      <div className="grid gap-2 max-h-52 overflow-y-auto pr-1">
        {availableServices.map((service) => {
          const isSelected = selectedAddOns.some((s) => s.id === service.id);
          
          return (
            <button
              key={service.id}
              onClick={() => toggleService(service)}
              className={cn(
                "flex items-center justify-between p-3 rounded-md border text-left transition-colors",
                isSelected 
                  ? "bg-primary/5 border-primary/30" 
                  : "hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center",
                  isSelected ? "bg-primary text-primary-foreground" : "border"
                )}>
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {language === 'ar' ? service.name_ar : service.name_en}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {service.duration} {language === 'ar' ? "دقيقة" : "min"}
                    </span>
                    <span className="flex items-center">
                      <CircleDollarSign className="h-3 w-3 mr-1" />
                      {isSelected ? (
                        <span className="flex items-center gap-1">
                          <PriceDisplay
                            price={Math.round(service.price * (1 - calculations.discountPercentage / 100))}
                            language={language as 'en' | 'ar'}
                            size="sm"
                            className="text-primary"
                          />
                          <span className="line-through opacity-70">
                            <PriceDisplay
                              price={service.price}
                              language={language as 'en' | 'ar'}
                              size="sm"
                            />
                          </span>
                        </span>
                      ) : (
                        <PriceDisplay
                          price={service.price}
                          language={language as 'en' | 'ar'}
                          size="sm"
                        />
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
