
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { MapPin } from "lucide-react";

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
  const { getCurrentDayHours } = useTimeFormatting();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#222222] mb-6">
            {language === 'ar' ? 'فروعنا' : 'Our Branches'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="h-[160px] flex flex-col items-center justify-center space-y-3 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => onLocationClick(branch.google_maps_url)}
            >
              <span className="font-semibold text-xl text-[#222222] group-hover:text-[#C4A36F] transition-colors text-center">
                {language === 'ar' ? branch.name_ar : branch.name}
              </span>
              <span className="text-sm text-gray-500 group-hover:text-[#C4A36F]/70 transition-colors text-center px-4">
                {language === 'ar' ? branch.address_ar : branch.address}
              </span>
              <div className="text-xs text-gray-400 group-hover:text-[#C4A36F]/60 transition-colors text-center px-4 flex flex-col gap-0.5">
                {getCurrentDayHours(branch.working_hours, language === 'ar')}
              </div>
              <MapPin className="h-6 w-6 text-[#C4A36F] mt-2" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
