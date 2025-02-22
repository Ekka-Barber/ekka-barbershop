
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Service } from "@/types/service";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatRiyal } from "@/utils/formatters";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: (service: Service) => void;
  className?: string;
}

export const ServiceCard = ({ service, isSelected, onSelect, className }: ServiceCardProps) => {
  const { language } = useLanguage();
  const serviceName = language === 'ar' ? service.name_ar : service.name_en;
  const serviceDescription = language === 'ar' ? service.description_ar : service.description_en;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Card
          className={cn(
            "relative overflow-hidden cursor-pointer transition-all",
            isSelected ? "border-[#C4A484] bg-[#C4A484]/5" : "hover:border-[#C4A484]/50",
            className
          )}
        >
          <div className="p-4">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <h3 className="font-medium text-base">{serviceName}</h3>
                <div className="text-sm text-muted-foreground">
                  {service.duration} {language === 'ar' ? 'دقيقة' : 'mins'}
                </div>
              </div>
              <div className="flex items-center gap-1 text-base font-semibold">
                <RiyalIcon className="w-3.5 h-3.5" />
                <span>{formatRiyal(service.price)}</span>
              </div>
            </div>
          </div>
        </Card>
      </SheetTrigger>

      <SheetContent side="bottom">
        <div className="max-h-[85vh] overflow-y-auto">
          <SheetHeader className="gap-6">
            <div className="space-y-2 text-center">
              <SheetTitle className="text-xl">{serviceName}</SheetTitle>
              {serviceDescription && (
                <SheetDescription className="whitespace-pre-wrap text-base leading-relaxed">
                  {serviceDescription}
                </SheetDescription>
              )}
            </div>
          </SheetHeader>

          <div className="mt-8">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {service.duration} {language === 'ar' ? 'دقيقة' : 'mins'}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <RiyalIcon className="w-4 h-4" />
                  <span>{formatRiyal(service.price)}</span>
                </div>
              </div>

              <Button
                onClick={() => onSelect(service)}
                variant={isSelected ? "outline" : "default"}
                className="w-full mt-4"
              >
                {isSelected
                  ? language === 'ar'
                    ? 'إزالة'
                    : 'Remove'
                  : language === 'ar'
                  ? 'إضافة'
                  : 'Add'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
