import { X } from 'lucide-react';
import React from 'react';

import { useMotionPreferences } from '@shared/hooks/useMotionPreferences';
import { Button } from "@shared/ui/components/button";
import AndroidIcon from '@shared/ui/components/icons/AndroidIcon';
import AppleIcon from '@shared/ui/components/icons/AppleIcon';

interface InstallButtonProps {
  platform: 'ios' | 'android';
  language: string;
  onClick: () => void;
  isInstalling?: boolean;
  onDismiss: () => void;
  handleInstallClick?: () => void;
}

export const InstallButton = React.forwardRef<HTMLDivElement, InstallButtonProps>((
  {
    platform,
    language,
    onClick,
    isInstalling = false,
    onDismiss,
    handleInstallClick
  },
  ref
) => {
  const Icon = platform === 'ios' ? AppleIcon : AndroidIcon;
  const isRTL = language === 'ar';
  const prefersReducedMotion = useMotionPreferences();

  // Use the provided handleInstallClick function or fallback to onClick
  const onClickHandler = handleInstallClick || onClick;

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <div className="relative space-y-1 mt-1 mb-1 transform-gpu">
        <Button
          className={`w-full flex items-center justify-center gap-3 py-6 text-lg font-semibold bg-gradient-to-r from-[#f2d197] via-[#efc780] to-[#e39f26] hover:from-[#FBC252] hover:via-[#f2d197] hover:to-[#efc780] text-[#181C27] transition-all duration-300 group shadow-[0_20px_45px_-15px_rgba(232,198,111,0.5),0_10px_25px_-10px_rgba(214,179,90,0.3)] hover:shadow-[0_25px_55px_-15px_rgba(232,198,111,0.6),0_15px_35px_-10px_rgba(214,179,90,0.4)] ${prefersReducedMotion ? '' : 'transform hover:-translate-y-1'} active:translate-y-0 disabled:opacity-70 border-2 border-white/20 backdrop-blur-sm rounded-2xl`}
          onClick={onClickHandler}
          disabled={isInstalling}
        >
          <div className={`flex items-center justify-center gap-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              <Icon />
            </div>
            <span className="text-xl font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
              {isInstalling
                ? (isRTL ? 'جاري التثبيت...' : 'Installing...')
                : (isRTL ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App')}
            </span>
          </div>
        </Button>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={onDismiss}
            className="text-sm text-[#f2d197] hover:text-[#efc780] transition-colors font-medium underline underline-offset-2"
          >
            {isRTL ? 'ليس الآن' : 'Not now'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label={isRTL ? "إغلاق" : "Close"}
          >
            <X size={14} className="text-[#f2d197]" />
          </button>
        </div>
        <p className={`text-sm text-muted-foreground text-center font-semibold mt-2 ${isRTL ? 'rtl' : 'ltr'}`}>
          {isRTL
            ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك'
            : 'Faster bookings, exclusive offers, and more features await you'}
        </p>
      </div>
    </div>
  );
});

InstallButton.displayName = "InstallButton";
