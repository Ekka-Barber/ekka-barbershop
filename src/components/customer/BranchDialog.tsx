
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTimeFormatting } from "@/hooks/useTimeFormatting";

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
              className="h-[80px] flex flex-row items-center gap-4 px-4 bg-white hover:bg-[#C4A36F]/5 border-2 border-gray-200 hover:border-[#C4A36F] transition-all duration-300 rounded-lg group"
              onClick={() => onBranchSelect(branch.id)}
            >
              <div className={`flex-1 flex flex-col items-${language === 'ar' ? 'end' : 'start'} gap-1`}>
                <span className="font-semibold text-base text-[#222222] group-hover:text-[#C4A36F] transition-colors">
                  {language === 'ar' ? branch.name_ar : branch.name}
                </span>
                <span className="text-sm text-gray-500 group-hover:text-[#C4A36F]/70 transition-colors">
                  {language === 'ar' ? branch.address_ar : branch.address}
                </span>
              </div>
              <div className="text-xs text-gray-400 group-hover:text-[#C4A36F]/60 transition-colors">
                {getCurrentDayHours(branch.working_hours, language === 'ar')}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
