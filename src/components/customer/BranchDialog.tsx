
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { useTracking } from "@/hooks/useTracking";
import { Clock } from "lucide-react";
import { useEffect, useRef } from "react";

interface Branch {
  id: string;
  name: string;
  name_ar: string;
  address: string;
  address_ar: string;
  working_hours: any;
}

interface BranchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branches: Branch[] | undefined;
  onBranchSelect: (branchId: string) => void;
}

export const BranchDialog = ({ 
  open, 
  onOpenChange, 
  branches,
  onBranchSelect 
}: BranchDialogProps) => {
  const { language, t } = useLanguage();
  const { getCurrentDayHours } = useTimeFormatting();
  const { trackInteraction } = useTracking();
  const dialogOpenTime = useRef<Date | null>(null);

  // Track dialog open
  useEffect(() => {
    if (open) {
      dialogOpenTime.current = new Date();
      trackInteraction('dialog_open', {
        dialog_type: 'branch_selection',
        page_url: window.location.pathname
      });
    } else if (dialogOpenTime.current) {
      const duration = new Date().getTime() - dialogOpenTime.current.getTime();
      trackInteraction('dialog_close', {
        dialog_type: 'branch_selection',
        duration_ms: duration,
        page_url: window.location.pathname
      });
      dialogOpenTime.current = null;
    }
  }, [open, trackInteraction]);

  const handleBranchSelect = (branch: Branch) => {
    trackInteraction('branch_select', {
      branch_id: branch.id,
      branch_name: language === 'ar' ? branch.name_ar : branch.name,
      branch_address: language === 'ar' ? branch.address_ar : branch.address,
      page_url: window.location.pathname,
      language: language
    });
    onBranchSelect(branch.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-4">
            {t('select.branch')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="w-full h-[90px] flex flex-row items-center justify-between gap-3 px-4 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => handleBranchSelect(branch)}
            >
              <div className={`flex flex-col items-${language === 'ar' ? 'end' : 'start'} flex-shrink min-w-0 max-w-[70%]`}>
                <span className="w-full font-bold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors truncate">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className={`flex-shrink-0 ${language === 'ar' ? 'border-s' : 'border-e'} border-gray-200 ${language === 'ar' ? 'ps-3' : 'pe-3'}`}>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#C4A36F]">
                  <Clock className="w-4 h-4" />
                  <span className="group-hover:text-[#C4A36F] transition-colors whitespace-nowrap">
                    {getCurrentDayHours(branch.working_hours, language === 'ar')}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
