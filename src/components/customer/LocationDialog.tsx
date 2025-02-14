
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { Clock, MapPin } from "lucide-react";

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  working_hours: any;
  google_maps_url: string | null;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onLocationClick: (url: string | null) => void;
}

export const LocationDialog = ({
  open,
  onOpenChange,
  branches,
  onLocationClick
}: LocationDialogProps) => {
  const { language } = useLanguage();
  const { getAllDaysHours } = useTimeFormatting();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-2">
            {language === 'ar' ? 'فروعنا' : 'Our Branches'}
          </DialogTitle>
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <MapPin className="w-4 h-4" />
            <span>
              {language === 'ar' 
                ? 'للوصول لأحد فروعنا اختر الفرع'
                : 'Select a branch to get directions'}
            </span>
          </div>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full flex flex-row items-start justify-between px-4 py-3 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => onLocationClick(branch.google_maps_url)}
            >
              <div className={`flex flex-col items-${language === 'ar' ? 'end' : 'start'} w-[40%]`}>
                <span className="w-full font-bold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors truncate">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className="w-[60%] flex flex-col gap-1">
                <Clock className="w-4 h-4 text-[#C4A36F] mb-1" />
                {getAllDaysHours(branch.working_hours, language === 'ar').map((dayHours, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="font-medium min-w-[65px] text-end">{dayHours.label}:</span>
                    <span className="text-[#C4A36F]">{dayHours.hours}</span>
                  </div>
                ))}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

