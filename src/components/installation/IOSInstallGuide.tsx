
import { Share } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';
import AddToHomeScreenIcon from '@/components/icons/AddToHomeScreenIcon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";

interface IOSInstallGuideProps {
  language: string;
  onCancel: () => void;
  trigger: React.ReactNode;
}

export const IOSInstallGuide = ({ language, onCancel, trigger }: IOSInstallGuideProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className={`${language === 'ar' ? 'rtl' : 'ltr'} font-changa rounded-t-xl p-0`}
      >
        <div className="p-6 space-y-6">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-center">
              {language === 'ar' ? 'لتثبيت التطبيق على الشاشة الرئيسية' : 'Add to Home Screen'}
            </SheetTitle>
            <SheetDescription className="text-center text-base font-medium">
              {language === 'ar' ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Share className="w-6 h-6 text-gray-600" />
                <span className="text-base">
                  {language === 'ar' ? 'انقر على زر المشاركة' : 'Tap the Share button'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex items-center gap-3 flex-1">
                <AddToHomeScreenIcon />
                <span className="text-base">
                  {language === 'ar' ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#9B87F5] text-white flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Check className="w-6 h-6 text-gray-600" />
                <span className="text-base">
                  {language === 'ar' ? 'انقر على "إضافة" للتأكيد' : 'Tap "Add" to confirm'}
                </span>
              </div>
            </div>
          </div>

          <SheetClose asChild>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={onCancel}
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
};
