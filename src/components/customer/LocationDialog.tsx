
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
        <div className="grid grid-cols-1 gap-4">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full flex flex-row items-start justify-between p-5 bg-white hover:bg-[#C4A36F]/5 border border-gray-100 hover:border-[#C4A36F] transition-all duration-300 rounded-xl shadow-sm hover:shadow-md group"
              onClick={() => onLocationClick(branch.google_maps_url)}
            >
              <div className={`flex flex-col items-${language === 'ar' ? 'end' : 'start'} w-[45%]`}>
                <h3 className="w-full text-lg font-bold text-[#222222] group-hover:text-[#C4A36F] transition-colors">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </h3>
                <p className="w-full text-sm text-gray-500 group-hover:text-[#C4A36F]/70 transition-colors mt-1.5">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </p>
              </div>
              <div className="w-[55%] flex flex-col items-end">
                <div className="flex items-center gap-2 mb-3 text-[#C4A36F]">
                  <span className="text-sm font-medium">Working Hours</span>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-2 items-end">
                  {getAllDaysHours(branch.working_hours, language === 'ar').map((dayHours, index) => (
                    <div key={index} className="flex items-center justify-end gap-3 text-sm">
                      <span className="font-medium text-[#222222]">{dayHours.label}:</span>
                      <span className="text-[#C4A36F] font-medium">{dayHours.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

