
import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getPlatformType
} from '@/services/platformDetection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, HomeIcon, SmartphoneIcon, XCircle } from 'lucide-react';

interface InstallationGuideProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const InstallationGuide = ({
  open,
  onOpenChange,
  onComplete
}: InstallationGuideProps) => {
  const { language } = useLanguage();
  const [platform] = useState(getPlatformType());
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches && onComplete) {
        onComplete();
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [onComplete]);

  const getInstructions = () => {
    if (platform === 'ios') {
      return language === 'ar' ? [
        'اضغط على زر المشاركة',
        'اختر "إضافة إلى الشاشة الرئيسية"',
        'اضغط "إضافة"'
      ] : [
        'Tap the Share button',
        'Choose "Add to Home Screen"',
        'Tap "Add"'
      ];
    }
    
    if (platform === 'android') {
      return language === 'ar' ? [
        'انتظر ظهور رسالة التثبيت',
        'اضغط على "تثبيت"',
        'اتبع التعليمات على الشاشة'
      ] : [
        'Wait for the install prompt',
        'Tap "Install"',
        'Follow the on-screen instructions'
      ];
    }

    return language === 'ar' ? [
      'عذراً، جهازك غير مدعوم',
      'يرجى استخدام هاتف iPhone أو Android'
    ] : [
      'Sorry, your device is not supported',
      'Please use an iPhone or Android phone'
    ];
  };

  const getIcon = (index: number) => {
    if (platform === 'ios' && index === 0) return <Share2 className="w-6 h-6" />;
    if (index === 1) return <HomeIcon className="w-6 h-6" />;
    if (index === 2) return <SmartphoneIcon className="w-6 h-6" />;
    return <XCircle className="w-6 h-6" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {language === 'ar' 
              ? 'تثبيت التطبيق'
              : 'Install App'
            }
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {getInstructions().map((instruction, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 rounded-lg bg-muted/50"
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                {getIcon(index)}
              </div>
              <p className="text-sm">{instruction}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InstallationGuide;
