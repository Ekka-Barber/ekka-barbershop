
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white border-0 shadow-2xl p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-[#222222] mb-4">
            {t('select.branch')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {branches?.map((branch) => (
            <Button
              key={branch.id}
              variant="outline"
              className="h-[90px] flex flex-row items-center gap-3 px-4 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group relative overflow-hidden"
              onClick={() => onBranchSelect(branch.id)}
            >
              <div className={`flex-1 flex flex-col items-${language === 'ar' ? 'end' : 'start'} gap-2 min-w-0`}>
                <span className="font-bold text-lg text-[#222222] group-hover:text-[#C4A36F] transition-colors line-clamp-1">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="text-sm text-gray-600 group-hover:text-[#C4A36F]/70 transition-colors line-clamp-1">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className={`border-s border-gray-200 ps-3 ${language === 'ar' ? 'border-s-0 border-e ps-0 pe-3' : ''}`}>
                <div className="flex items-center gap-1.5 text-sm font-medium text-[#C4A36F] whitespace-nowrap">
                  <Clock className="w-4 h-4" />
                  <span className="group-hover:text-[#C4A36F] transition-colors">
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
