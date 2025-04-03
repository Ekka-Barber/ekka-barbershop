
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Service } from "@/types/service";

interface PackageDialogFooterProps {
  onClose: () => void;
  handleConfirm: () => void;
  baseService: Service | null;
  language: string;
}

export const PackageDialogFooter = ({
  onClose,
  handleConfirm,
  baseService,
  language
}: PackageDialogFooterProps) => {
  return (
    <div className="flex justify-between gap-2 pt-2">
      <Button variant="outline" onClick={onClose} className="flex-1">
        {language === 'ar' ? "إلغاء" : "Cancel"}
      </Button>
      <Button 
        onClick={handleConfirm} 
        disabled={!baseService}
        className="flex-1"
      >
        <CheckCircle2 className="h-4 w-4 mr-2" />
        {language === 'ar' ? "تأكيد الباقة" : "Confirm Package"}
      </Button>
    </div>
  );
};
