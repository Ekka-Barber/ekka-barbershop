import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  duration: number;
}

interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  services: Service[];
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

export const ServiceSelection = ({
  categories,
  isLoading,
  selectedServices,
  onServiceToggle
}: ServiceSelectionProps) => {
  const { language } = useLanguage();

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
        {categories?.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-lg font-semibold">
              {language === 'ar' ? category.name_ar : category.name_en}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                {category.services?.map((service) => (
                  <div key={service.id} className="flex items-start space-x-4 rtl:space-x-reverse">
                    <Checkbox
                      checked={selectedServices.some(s => s.id === service.id)}
                      onCheckedChange={() => onServiceToggle(service)}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {language === 'ar' ? service.name_ar : service.name_en}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? service.description_ar : service.description_en}
                      </p>
                      <div className="mt-1 text-sm">
                        {service.price} SAR • {service.duration} min
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};