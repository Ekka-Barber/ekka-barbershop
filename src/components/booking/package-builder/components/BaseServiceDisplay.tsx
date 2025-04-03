
import { Service } from "@/types/service";
import { Info } from "lucide-react";
import { PriceDisplay } from "@/components/ui/price-display";

interface BaseServiceDisplayProps {
  baseService: Service;
  language: string;
}

export const BaseServiceDisplay = ({ baseService, language }: BaseServiceDisplayProps) => {
  return (
    <div className="rounded-md border p-3 bg-muted/30">
      <div className="flex items-start">
        <div className="p-1.5 bg-primary/10 rounded-md mr-3">
          <Info className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="font-medium text-sm flex justify-between">
            <span>
              {language === 'ar' 
                ? "الخدمة الأساسية" 
                : "Base Service"}
            </span>
            <PriceDisplay
              price={baseService.price}
              language={language as 'en' | 'ar'}
              size="sm"
              className="text-primary"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? baseService.name_ar : baseService.name_en}
          </p>
        </div>
      </div>
    </div>
  );
};
