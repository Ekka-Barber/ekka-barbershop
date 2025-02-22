
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Service } from "@/types/service";
import RiyalIcon from "@/components/icons/RiyalIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatRiyal } from "@/utils/formatters";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

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
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(service);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Card
          className={cn(
            "relative overflow-hidden cursor-pointer transition-all p-4",
            isSelected ? "border-[#C4A484] bg-[#C4A484]/5" : "hover:border-[#C4A484]/50",
            className
          )}
        >
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-base">{serviceName}</h3>
              {!isSelected && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 rounded-full hover:bg-[#C4A484]/10"
                  onClick={handleSelect}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground mb-2">
              {service.duration} {language === 'ar' ? 'دقيقة' : 'mins'}
            </div>
            <div className="flex items-center gap-1 text-base font-semibold">
              <span>{formatRiyal(service.price)}</span>
              <RiyalIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        </Card>
      </SheetTrigger>

      <SheetContent side="bottom">
        <div className="rounded-t-xl border-t-2 border-[#C4A484] bg-white max-h-[85vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <SheetTitle>{serviceName}</SheetTitle>
              {serviceDescription && (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap text-base leading-relaxed">
                  {serviceDescription}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {service.duration} {language === 'ar' ? 'دقيقة' : 'mins'}
                </div>
                <div className="flex items-center gap-1 text-lg font-semibold">
                  <span>{formatRiyal(service.price)}</span>
                  <RiyalIcon className="w-4 h-4" />
                </div>
              </div>

              <Button
                onClick={() => {
                  onSelect(service);
                  setIsOpen(false);
                }}
                variant={isSelected ? "outline" : "default"}
                className="w-full"
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
