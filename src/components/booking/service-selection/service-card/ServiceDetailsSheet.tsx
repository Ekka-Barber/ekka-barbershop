
import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Service } from "@/types/service";
import { Language } from "@/types/language";

interface ServiceDetailsSheetProps {
  service: Service;
  isSelected: boolean;
  language: Language;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelect: (service: Service) => void;
  serviceName?: string;
  serviceDescription?: string | null;
  finalPrice?: number;
  hasDiscount?: boolean;
}

export const ServiceDetailsSheet = ({
  service,
  isSelected,
  language,
  isOpen,
  setIsOpen,
  onSelect,
  serviceName,
  serviceDescription
}: ServiceDetailsSheetProps) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(service);
    setIsOpen(false);
  };

  const onClose = () => setIsOpen(false);
  
  // Use the provided serviceName or derive it from the service
  const displayName = serviceName || (language === 'ar' ? service.name_ar : service.name_en);
  // Use the provided serviceDescription or derive it from the service
  const displayDescription = serviceDescription || (language === 'ar' ? service.description_ar : service.description_en);
  
  return (
    <SheetContent
      side="bottom"
      className="p-0 rounded-t-2xl border-t-0 max-h-[85vh] sm:max-w-full bg-gradient-to-b from-[#f8f8f8] to-white"
      onCloseAutoFocus={(e) => e.preventDefault()}
    >
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-start">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-full h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          
          <SheetHeader className="text-center space-y-1">
            <SheetTitle className="text-xl font-semibold">
              {displayName}
            </SheetTitle>
          </SheetHeader>
          
          <div className="w-8 h-8"></div> {/* Empty div for balance */}
        </div>

        {displayDescription && (
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium text-right">
              {language === 'ar' ? 'وصف الخدمة' : 'Description'}
            </div>
            <p className="text-sm text-muted-foreground text-right leading-relaxed">{displayDescription}</p>
          </div>
        )}

        <Button 
          className="w-full mt-6 bg-[#C4A484] hover:bg-[#B8997C] text-white font-medium py-2 px-4 rounded-lg shadow-md transform transition-transform hover:scale-[1.02] active:scale-[0.98]" 
          onClick={handleSelect}
          size="sm"
        >
          {isSelected
            ? language === 'ar' ? 'إزالة الخدمة' : 'Remove Service'
            : language === 'ar' ? 'اضف الخدمة' : 'Add Service'}
        </Button>
      </div>
    </SheetContent>
  );
};
