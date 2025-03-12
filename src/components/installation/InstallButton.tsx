
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/custom-badge";
import { X } from 'lucide-react';
import AndroidIcon from '@/components/icons/AndroidIcon';
import AppleIcon from '@/components/icons/AppleIcon';

interface InstallButtonProps {
  platform: 'ios' | 'android';
  language: string;
  onClick: () => void;
  isInstalling?: boolean;
  onDismiss: () => void;
  isAdmin?: boolean;
}

export const InstallButton = ({ 
  platform, 
  language, 
  onClick, 
  isInstalling = false,
  onDismiss,
  isAdmin = false
}: InstallButtonProps) => {
  const Icon = platform === 'ios' ? AppleIcon : AndroidIcon;
  const isRTL = language === 'ar';

  // Special styling for admin
  const bgClass = isAdmin 
    ? "bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900" 
    : "bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#F97316]";

  return (
    <div className="relative space-y-2 mt-6 mb-3 hardware-accelerated">
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
        className={`w-full flex items-center justify-center gap-3 py-6 text-lg font-medium ${bgClass} hover:opacity-90 text-white transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70`}
        onClick={onClick}
        disabled={isInstalling}
      >
        <div className={`flex items-center justify-center gap-6 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <Icon />
          <span className="font-changa text-xl font-bold animate-[heart-beat_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            {isInstalling 
              ? (isRTL ? 'جاري التثبيت...' : 'Installing...') 
              : isAdmin
                ? 'Download Ekka Admin App'
                : (isRTL ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App')}
          </span>
        </div>
      </Button>
      <p className={`text-sm text-muted-foreground text-center font-changa font-semibold ${isRTL ? 'rtl' : 'ltr'}`}>
        {isAdmin
          ? 'Access admin features offline and get a dedicated app icon'
          : (isRTL 
            ? 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك' 
            : 'Faster bookings, exclusive offers, and more features await you')}
      </p>
    </div>
  );
};
