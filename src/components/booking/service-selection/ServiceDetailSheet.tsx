
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Service } from "@/types/service";
import { Package } from "lucide-react";

interface ServiceDetailSheetProps {
  service: Service | null;
  isSelected: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (service: Service) => void;
  language: string;
  isBasePackageService?: boolean;
}

export const ServiceDetailSheet = ({
  service,
  isSelected,
  isOpen,
  onClose,
  onSelect,
  language,
  isBasePackageService = false
}: ServiceDetailSheetProps) => {
  if (!service || !isOpen) return null;
  
  const serviceName = language === 'ar' ? service.name_ar : service.name_en;
  const serviceDescription = language === 'ar' ? service.description_ar : service.description_en;
  
  const handleSelectService = () => {
    onSelect(service);
    onClose();
  };

  return (
    <SheetContent side="bottom" className="bg-transparent p-0">
      <div className="rounded-t-xl border-t-2 border-[#C4A484] bg-white">
        <div className="p-6 space-y-6">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <SheetTitle className="flex-1">
                {serviceName}
              </SheetTitle>
              {isBasePackageService && (
                <div className="flex items-center bg-[#FCF9F0] border border-[#e9d8a6] rounded-full px-2 py-1">
                  <Package className="h-3.5 w-3.5 text-[#C4A484] mr-1" />
                  <span className="text-xs font-medium text-[#6f5b3e]">
                    {language === 'ar' ? 'باقة' : 'Package'}
                  </span>
                </div>
              )}
            </div>
          </SheetHeader>
          
          <div className="mt-6 space-y-4">
            <p className="text-gray-600">
              {serviceDescription}
            </p>
            
            {isBasePackageService && (
              <div className="bg-[#FCF9F0] border border-[#e9d8a6] rounded-lg p-3 mt-4 text-sm text-[#6f5b3e]">
                <p>
                  {language === 'ar' 
                    ? 'اختر هذه الخدمة الأساسية وأضف خدمات أخرى للاستفادة من خصومات الباقة'
                    : 'Select this base service and add other services to benefit from package discounts'}
                </p>
              </div>
            )}
            
            <Button
              className="w-full mt-4"
              onClick={handleSelectService}
            >
              {isSelected
                ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
                : language === 'ar' ? 'إضافة الخدمة' : 'Add Service'}
            </Button>
          </div>
        </div>
      </div>
    </SheetContent>
  );
};
