
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";
import { Clock } from "lucide-react";
import { formatWorkingHoursForDisplay } from "@/utils/workingHoursUtils";
import { formatTimeRange } from "@/utils/timeFormatting";

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
  const isArabic = language === 'ar';
  
  const formatBranchHours = (workingHours: any): string => {
    const timeRanges = formatWorkingHoursForDisplay(workingHours);
    
    // For Arabic, we need to convert the time ranges to Arabic numerals
    if (isArabic) {
      return timeRanges
        .map(range => formatTimeRange(range, true))
        .join(' ، ');
    }
    
    return timeRanges.join(', ');
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
              onClick={() => onBranchSelect(branch.id)}
            >
              <div className={`flex flex-col items-${isArabic ? 'end' : 'start'} flex-shrink min-w-0 max-w-[70%]`}>
                <span className="w-full font-bold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors truncate">
                  {isArabic ? branch.name_ar : branch.name}
                </span>
                <span className="w-full text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors truncate mt-1">
                  {isArabic ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className={`flex-shrink-0 ${isArabic ? 'border-s' : 'border-e'} border-gray-200 ${isArabic ? 'ps-3' : 'pe-3'}`}>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="text-[#333333]">{isArabic ? 'ساعات العمل اليوم' : "Today's working Hrs"}</span>
                    <Clock className="w-3.5 h-3.5 text-[#C4A36F]" />
                  </div>
                  <span className="text-xs font-medium text-[#C4A36F] whitespace-nowrap">
                    {formatBranchHours(branch.working_hours)}
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
