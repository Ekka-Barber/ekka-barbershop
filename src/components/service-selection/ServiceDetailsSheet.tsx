
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Service } from '@/types/service';

interface ServiceDetailsSheetProps {
  service: Service | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onServiceToggle: (service: Service) => void;
  isSelected: boolean;
  language: string;
}

export const ServiceDetailsSheet = ({
  service,
  isOpen,
  onOpenChange,
  onServiceToggle,
  isSelected,
  language
}: ServiceDetailsSheetProps) => {
  if (!service) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-fit">
        <SheetHeader>
          <SheetTitle>
            {language === 'ar' ? service.name_ar : service.name_en}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <p className="text-gray-600">
            {language === 'ar' ? service.description_ar : service.description_en}
          </p>
          
          <Button
            className="w-full mt-4"
            onClick={() => onServiceToggle(service)}
          >
            {isSelected
              ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
              : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
