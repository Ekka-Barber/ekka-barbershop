import { Timer, Slash, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { convertToArabic } from "@/utils/arabicNumerals";

interface Service {
  id: string;
  name_ar: string;
  name_en: string;
  duration: number;
  price: number;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number | null;
}

interface ServiceCardProps {
  service: Service;
  language: string;
  isSelected: boolean;
  onServiceClick: (service: Service) => void;
  onServiceToggle: (service: Service) => void;
}

export const ServiceCard = ({ 
  service, 
  language, 
  isSelected,
  onServiceClick,
  onServiceToggle 
}: ServiceCardProps) => {
  const formatPrice = (price: number) => {
    const roundedPrice = Math.floor(price);
    const formattedNumber = language === 'ar' 
      ? convertToArabic(roundedPrice.toString())
      : roundedPrice.toString();
    
    return (
      <span className="inline-flex items-center gap-0.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {formattedNumber}
        <RiyalIcon />
      </span>
    );
  };

  const getArabicTimeUnit = (duration: number) => {
    return duration >= 5 && duration <= 10 ? 'دقائق' : 'دقيقة';
  };

  const hasDiscount = (service: Service) => {
    return service.discount_type && service.discount_value;
  };

  const calculateDiscountedPrice = (service: Service) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    let discountedPrice;
    if (service.discount_type === 'percentage') {
      discountedPrice = service.price - (service.price * (service.discount_value / 100));
    } else {
      discountedPrice = service.price - service.discount_value;
    }
    return Math.floor(discountedPrice);
  };

  return (
    <div
      className={`rounded-lg border p-4 space-y-2 transition-all cursor-pointer relative ${
        isSelected
          ? 'bg-[#e7bd71]/10 border-[#e7bd71]'
          : 'hover:border-gray-300'
      }`}
      onClick={() => onServiceClick(service)}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium">
          {language === 'ar' ? service.name_ar : service.name_en}
        </h3>
        {hasDiscount(service) && (
          <Badge variant="destructive" className="text-xs">
            {service.discount_type === 'percentage' 
              ? `${language === 'ar' ? convertToArabic(service.discount_value?.toString() || '0') : service.discount_value}%` 
              : formatPrice(service.discount_value || 0)}
          </Badge>
        )}
      </div>

      <div className="flex items-center text-sm text-gray-500">
        <Timer className="w-4 h-4 mr-1" />
        <span>
          {language === 'ar' 
            ? `${convertToArabic(service.duration.toString())} ${getArabicTimeUnit(service.duration)}`
            : `${service.duration} min`}
        </span>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {hasDiscount(service) ? (
            <>
              <span className="relative inline-flex items-center text-sm text-gray-500">
                {formatPrice(service.price)}
                <Slash className="w-4 h-4 text-destructive absolute -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2" />
              </span>
              <span className="font-medium">
                {formatPrice(calculateDiscountedPrice(service))}
              </span>
            </>
          ) : (
            <span>{formatPrice(service.price)}</span>
          )}
        </div>
        
        <Button
          size="sm"
          variant={isSelected ? "default" : "outline"}
          className={`rounded-full p-2 h-8 w-8 ${
            isSelected ? 'bg-[#e7bd71] hover:bg-[#d4ad65]' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onServiceToggle(service);
          }}
        >
          {isSelected ? (
            <Check className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
