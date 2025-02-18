
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/formatting/price";
import { Service } from "@/types/service";

interface ServiceCardHeaderProps {
  service: Service;
  language: string;
  hasDiscount: boolean;
}

export const ServiceCardHeader = ({ service, language, hasDiscount }: ServiceCardHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <h3 className="font-medium">
        {language === 'ar' ? service.name_ar : service.name_en}
      </h3>
      {hasDiscount && (
        <Badge variant="destructive" className="text-xs">
          {service.discount_type === 'percentage' 
            ? `${service.discount_value}%` 
            : formatPrice(service.discount_value || 0, language)}
        </Badge>
      )}
    </div>
  );
};
