import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { useTracking } from "@/hooks/useTracking";
import { Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Branch } from "@/types/branch";

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
  const { trackBranchSelection } = useTracking();
  const dialogOpenTime = useRef<Date | null>(null);

  useEffect(() => {
    if (open) {
      const now = new Date();
      dialogOpenTime.current = now;
      trackBranchSelection({
        event_name: 'branch_dialog_opened',
        interaction_type: 'dialog_open',
        source_page: window.location.pathname,
        dialog_open_time: now.toISOString()
      });
    } else if (dialogOpenTime.current) {
      const closeTime = new Date();
      trackBranchSelection({
        event_name: 'branch_dialog_closed',
        interaction_type: 'dialog_close',
        source_page: window.location.pathname,
        dialog_open_time: dialogOpenTime.current.toISOString(),
        dialog_close_time: closeTime.toISOString()
      });
      dialogOpenTime.current = null;
    }
  }, [open, trackBranchSelection]);

  const handleBranchSelect = (branch: Branch) => {
    trackBranchSelection({
      event_name: 'branch_selected',
      interaction_type: 'branch_select',
      branch_id: branch.id,
      selected_branch_name: language === 'ar' ? branch.name_ar || branch.name : branch.name,
      source_page: window.location.pathname
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
                  {language === 'ar' ? branch.name_ar || branch.name : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {language === 'ar' ? branch.address_ar || branch.address : branch.address}
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
