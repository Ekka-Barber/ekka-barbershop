
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { Clock, Car } from "lucide-react";
import { useTracking } from "@/hooks/useTracking";
import { useEffect, useRef } from "react";
import { Branch } from "@/types/branch";

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
  const { trackInteraction } = useTracking();
  const dialogOpenTime = useRef<Date | null>(null);

  useEffect(() => {
    if (open) {
      dialogOpenTime.current = new Date();
      trackInteraction('dialog_open', {
        dialog_type: 'location_selection',
        page_url: window.location.pathname
      });
    } else if (dialogOpenTime.current) {
      const duration = new Date().getTime() - dialogOpenTime.current.getTime();
      trackInteraction('dialog_close', {
        dialog_type: 'location_selection',
        duration_ms: duration,
        page_url: window.location.pathname
      });
      dialogOpenTime.current = null;
    }
  }, [open, trackInteraction]);

  const handleLocationClick = (branch: Branch) => {
    trackInteraction('button_click', {
      action: 'location_select',
      branch_id: branch.id,
      branch_name: language === 'ar' ? branch.name_ar || branch.name : branch.name,
      branch_address: language === 'ar' ? branch.address_ar || branch.address : branch.address,
      has_maps_url: !!branch.google_maps_url,
      page_url: window.location.pathname,
      language: language
    });
    onLocationClick(branch.google_maps_url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-2">
            {language === 'ar' ? 'فروعنا' : 'Our Branches'}
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-600 mb-4 flex items-center justify-center gap-2">
            {language === 'ar' ? (
              <>
                اختر الفرع، للوصول السريع
                <Car className="w-4 h-4 text-[#C4A36F]" />
              </>
            ) : (
              <>
                Choose a branch for quick directions
                <Car className="w-4 h-4 text-[#C4A36F]" />
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full h-[100px] flex flex-row items-center justify-between gap-3 px-4 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => handleLocationClick(branch)}
            >
              <div className={`flex flex-col items-${language === 'ar' ? 'end' : 'start'} flex-shrink min-w-0 max-w-[70%]`}>
                <span className="w-full font-bold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors truncate">
                  {language === 'ar' ? branch.name_ar || branch.name : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {language === 'ar' ? branch.address_ar || branch.address : branch.address}
                </span>
              </div>
              <div className={`flex-shrink-0 ${language === 'ar' ? 'border-s' : 'border-e'} border-gray-200 ${language === 'ar' ? 'ps-3' : 'pe-3'}`}>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#C4A36F]" />
                    <span className="text-[#333333] font-medium">
                      {language === 'ar' ? 'السبت - الخميس' : 'Sat - Thu'}
                    </span>
                  </div>
                  {getAllDaysHours(branch.working_hours, language === 'ar')
                    .filter(dayHours => dayHours.label.includes(language === 'ar' ? 'السبت' : 'Sat'))
                    .map((dayHours, index) => (
                      <span key={index} className="text-[#C4A36F] font-medium leading-tight">
                        {dayHours.hours}
                      </span>
                    ))}
                  <span className="text-[#333333] font-medium">
                    {language === 'ar' ? 'الجمعة' : 'Friday'}
                  </span>
                  {getAllDaysHours(branch.working_hours, language === 'ar')
                    .filter(dayHours => dayHours.label.includes(language === 'ar' ? 'الجمعة' : 'Fri'))
                    .map((dayHours, index) => (
                      <span key={index} className="text-[#C4A36F] font-medium leading-tight">
                        {dayHours.hours}
                      </span>
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
