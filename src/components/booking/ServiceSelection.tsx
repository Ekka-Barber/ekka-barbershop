import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slash } from "lucide-react";

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  duration: number;
  discount_type: 'percentage' | 'amount' | null;
  discount_value: number | null;
  display_order: number;
}

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  services: Service[];
  display_order: number;
}

interface SelectedService {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface ServiceSelectionProps {
  categories: Category[] | undefined;
  isLoading: boolean;
  selectedServices: SelectedService[];
  onServiceToggle: (service: Service) => void;
}

const roundPrice = (price: number) => {
  const decimal = price % 1;
  if (decimal >= 0.5) {
    return Math.ceil(price);
  } else if (decimal <= 0.4) {
    return Math.floor(price);
  }
  return price;
};

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle
}: ServiceSelectionProps) => {
  const { language } = useLanguage();

  const formatPrice = (price: number) => {
    const roundedPrice = roundPrice(price);
    return `${roundedPrice} ${language === 'ar' ? 'ريال' : 'SAR'}`;
  };

  const calculateDiscountedPrice = (service: Service) => {
    if (!service.discount_type || !service.discount_value) return service.price;
    
    let discountedPrice;
    if (service.discount_type === 'percentage') {
      discountedPrice = service.price - (service.price * (service.discount_value / 100));
    } else {
      discountedPrice = service.price - service.discount_value;
    }
    return roundPrice(discountedPrice);
  };

  const hasDiscount = (service: Service) => {
    return service.discount_type && service.discount_value;
  };

  // Sort categories by display_order
  const sortedCategories = categories?.slice().sort((a, b) => a.display_order - b.display_order);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {sortedCategories?.map((category) => {
          // Sort services by display_order within each category
          const sortedServices = category.services?.slice().sort((a, b) => a.display_order - b.display_order);
          
          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-lg font-semibold">
                {language === 'ar' ? category.name_ar : category.name_en}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 p-4">
                  {sortedServices?.map((service) => (
                    <div key={service.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                      <Checkbox
                        checked={selectedServices.some(s => s.id === service.id)}
                        onCheckedChange={() => onServiceToggle(service)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {language === 'ar' ? service.name_ar : service.name_en}
                          </h4>
                          {hasDiscount(service) && (
                            <Badge variant="destructive" className="text-xs">
                              {service.discount_type === 'percentage' 
                                ? `${service.discount_value}%` 
                                : formatPrice(service.discount_value || 0)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? service.description_ar : service.description_en}
                        </p>
                        <div className="mt-1 text-sm flex items-center gap-2">
                          {hasDiscount(service) ? (
                            <>
                              <div className="relative inline-flex items-center">
                                <span className="text-foreground">
                                  {formatPrice(service.price)}
                                </span>
                                <Slash className="w-4 h-4 text-destructive absolute -translate-y-1/2 top-1/2 left-1/2 -translate-x-1/2" />
                              </div>
                              <span className="font-medium">
                                {formatPrice(calculateDiscountedPrice(service))}
                              </span>
                            </>
                          ) : (
                            <span>{formatPrice(service.price)}</span>
                          )}
                          <span>•</span>
                          <span>{service.duration} min</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};