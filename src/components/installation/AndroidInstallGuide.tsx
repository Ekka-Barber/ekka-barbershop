
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AndroidInstallGuideProps {
  language: string;
  isOpen: boolean;
  isInstalling: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: () => void;
  trigger: React.ReactNode;
}

export const AndroidInstallGuide = ({
  language,
  isOpen,
  isInstalling,
  onOpenChange,
  onInstall,
  trigger
}: AndroidInstallGuideProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent className={`${language === 'ar' ? 'rtl' : 'ltr'} max-w-md font-changa`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl">
            {language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {language === 'ar' 
                ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك'
                : 'Faster bookings, exclusive offers, and extra benefits await you'}
            </p>
            <div className="mt-4 text-base whitespace-pre-line">
              {language === 'ar'
                ? 'هل تريد تثبيت تطبيق إكّـه على جهازك؟'
                : 'Would you like to install Ekka app on your device?'}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={language === 'ar' ? 'flex-row-reverse' : ''}>
          <AlertDialogCancel className="font-changa">
            {language === 'ar' ? 'إلغاء' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onInstall}
            disabled={isInstalling}
            className="gap-2 font-changa"
          >
            {isInstalling && <Loader2 className="h-4 w-4 animate-spin" />}
            {isInstalling 
              ? (language === 'ar' ? 'جاري التثبيت...' : 'Installing...')
              : (language === 'ar' ? 'تثبيت' : 'Install')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
