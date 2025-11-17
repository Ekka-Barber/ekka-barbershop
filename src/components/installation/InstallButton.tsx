import React from 'react';
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/custom-badge";
import { X } from 'lucide-react';
import AndroidIcon from '@/components/icons/AndroidIcon';
import AppleIcon from '@/components/icons/AppleIcon';
import { Share } from 'lucide-react';

interface InstallButtonProps {
  platform: 'ios' | 'android';
  language: string;
  onClick: () => void;
  isInstalling?: boolean;
  onDismiss: () => void;
  showInstructions?: boolean;
  handleInstallClick?: () => void;
}

export const InstallButton = React.forwardRef<HTMLDivElement, InstallButtonProps>((
  { 
    platform, 
    language, 
    onClick, 
    isInstalling = false,
    onDismiss,
    showInstructions = false,
    handleInstallClick
  },
  ref
) => {
  const Icon = platform === 'ios' ? AppleIcon : AndroidIcon;
  const isRTL = language === 'ar';
  
  // Use the provided handleInstallClick function or fallback to onClick
  const onClickHandler = handleInstallClick || onClick;

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      {showInstructions && platform === 'ios' && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-md text-blue-800 text-sm">
          {language === 'ar' ? (
            <p>
              لتثبيت التطبيق، انقر على زر المشاركة <Share className="inline h-4 w-4 mx-1" /> في الأسفل ثم اختر <span className="font-semibold">'إضافة إلى الصفحة الرئيسية'</span>.
            </p>
          ) : (
            <p>
              To install, tap the Share button <Share className="inline h-4 w-4 mx-1" /> below and select <span className="font-semibold">'Add to Home Screen'</span>.
            </p>
          )}
        </div>
      )}
      <div className="relative space-y-1 mt-1 mb-1 transform-gpu">
        <div className="absolute -top-3 -right-3 z-10 flex items-center justify-center">
          <CustomBadge 
            variant="secondary" 
            className="bg-[#FFD700] text-black border-none shadow-md px-3 py-1.5 rounded-full font-black text-xs animate-bounce"
          >
            {isRTL ? 'جديد' : 'NEW'}
          </CustomBadge>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-2 rounded-full bg-gray-200 p-1 shadow-md hover:bg-gray-300 transition-colors"
            aria-label={isRTL ? "إغلاق" : "Close"}
          >
            <X size={16} />
          </button>
        </div>
        <Button
          className="w-full flex items-center justify-center gap-3 py-6 text-lg font-semibold bg-gradient-to-r from-[#9B6CF6] via-[#E956FF] to-[#FF7326] hover:from-[#AB7CFF] hover:via-[#F966FF] hover:to-[#FF8336] text-white transition-all duration-300 group shadow-[0_20px_45px_-15px_rgba(139,92,246,0.5),0_10px_25px_-10px_rgba(217,70,239,0.3)] hover:shadow-[0_25px_55px_-15px_rgba(139,92,246,0.6),0_15px_35px_-10px_rgba(217,70,239,0.4)] transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 border-2 border-white/20 backdrop-blur-sm rounded-2xl"
          onClick={onClickHandler}
          disabled={isInstalling}
        >
          <div className={`flex items-center justify-center gap-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <Icon />
            </div>
            <span className="text-xl font-semibold animate-[heart-beat_2s_cubic-bezier(0.4,0,0.6,1)_infinite] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              {isInstalling 
                ? (isRTL ? 'جاري التثبيت...' : 'Installing...') 
                : (isRTL ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App')}
            </span>
          </div>
        </Button>
        <p className={`text-sm text-muted-foreground text-center font-semibold ${isRTL ? 'rtl' : 'ltr'}`}>
          {isRTL 
            ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك' 
            : 'Faster bookings, exclusive offers, and more features await you'}
        </p>
      </div>
    </div>
  );
});

InstallButton.displayName = "InstallButton";
