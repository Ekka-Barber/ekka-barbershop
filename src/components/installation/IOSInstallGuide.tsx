
import { Share, Check } from 'lucide-react';
import { Button } from "@/components/ui/button";
import AddToHomeScreenIcon from '@/components/icons/AddToHomeScreenIcon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";

interface IOSInstallGuideProps {
  language: string;
  onCancel: () => void;
  trigger: React.ReactNode;
}

export const IOSInstallGuide = ({ language, onCancel, trigger }: IOSInstallGuideProps) => {
  const isRTL = language === 'ar';
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className={`${isRTL ? 'rtl' : 'ltr'} rounded-t-xl p-0 bg-white pb-[calc(var(--sab)+1rem)]`}
      >
        <div className="p-6 space-y-6">
          <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-2" />
          
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-center">
              {isRTL ? 'لتثبيت التطبيق على الشاشة الرئيسية' : 'Add to Home Screen'}
            </SheetTitle>
            <SheetDescription className="text-center text-base font-medium">
              {isRTL ? 'اتبع الخطوات التالية:' : 'Follow these steps:'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#E8C66F] to-[#D6B35A] text-[#181C27] flex items-center justify-center font-bold shadow-md">
                1
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Share className="w-6 h-6 text-gray-600 flex-shrink-0" />
                <span className="text-base">
                  {isRTL ? 'انقر على زر المشاركة' : 'Tap the Share button'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#D6B35A] to-[#C79A2A] text-[#181C27] flex items-center justify-center font-bold shadow-md">
                2
              </div>
              <div className="flex items-center gap-3 flex-1">
                <AddToHomeScreenIcon className="text-gray-600" />
                <span className="text-base">
                  {isRTL ? 'اختر "إضافة إلى الشاشة الرئيسية"' : 'Choose "Add to Home Screen"'}
                </span>
              </div>
            </div>

            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#C79A2A] to-[#E8C66F] text-[#181C27] flex items-center justify-center font-bold shadow-md">
                3
              </div>
              <div className="flex items-center gap-3 flex-1">
                <Check className="w-6 h-6 text-gray-600 flex-shrink-0" />
                <span className="text-base">
                  {isRTL ? 'انقر على "إضافة" للتأكيد' : 'Tap "Add" to confirm'}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'} text-sm text-gray-600`}>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-400 text-white flex items-center justify-center">
                  <span className="text-xs">!</span>
                </div>
                <p>
                  {isRTL 
                    ? 'سيظهر تطبيق إكّـه على شاشتك الرئيسية مع كل مزايا التطبيق الكاملة!' 
                    : 'Ekka will appear on your home screen with full app functionality!'}
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className={`flex ${isRTL ? 'flex-row-reverse' : 'flex-row'} gap-4 mt-6`}>
            <SheetClose asChild>
              <Button 
                variant="outline" 
                className="flex-1 min-h-12"
                onClick={onCancel}
              >
                {isRTL ? 'ليس الآن' : 'Not now'}
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button
                className="flex-1 bg-gradient-to-r from-[#E8C66F] to-[#D6B35A] hover:from-[#FBC252] hover:to-[#E8C66F] text-[#181C27] min-h-12"
              >
                {isRTL ? 'فهمت' : 'Got it'}
              </Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};
