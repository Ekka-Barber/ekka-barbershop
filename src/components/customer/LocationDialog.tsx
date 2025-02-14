
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { Clock } from "lucide-react";

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
          <DialogTitle className="text-center text-2xl font-bold text-[#222222] mb-6">
            {language === 'ar' ? 'فروعنا' : 'Our Branches'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50/80 border border-gray-100 rounded-xl group"
              onClick={() => onLocationClick(branch.google_maps_url)}
            >
              <div className="flex items-center gap-2 text-[#C4A36F]">
                <Clock className="w-4 h-4" />
                <div className="flex flex-col gap-1 items-start">
                  {getAllDaysHours(branch.working_hours, language === 'ar').map((dayHours, index) => (
                    <span key={index} className="text-sm font-medium">
                      {dayHours.hours}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-end">
                <h3 className="text-2xl font-bold text-[#222222] mb-1">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
