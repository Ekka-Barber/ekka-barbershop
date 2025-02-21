
import { Button } from "@/components/ui/button";
import { CustomBadge } from "@/components/ui/custom-badge";
import AndroidIcon from '@/components/icons/AndroidIcon';
import AppleIcon from '@/components/icons/AppleIcon';

interface InstallButtonProps {
  platform: 'ios' | 'android';
  language: string;
  onClick: () => void;
}

export const InstallButton = ({ platform, language, onClick }: InstallButtonProps) => {
  const Icon = platform === 'ios' ? AppleIcon : AndroidIcon;

  return (
    <div className="relative space-y-2">
      <div className="absolute -top-2 -right-2 z-10">
        <CustomBadge variant="secondary" className="bg-[#C4A36F] text-white border-none">
          {language === 'ar' ? 'جديد' : 'NEW'}
        </CustomBadge>
      </div>
      <Button
        className="w-full flex items-center justify-center gap-3 py-6 text-lg font-medium bg-[#9B87F5] hover:bg-[#8A74F2] text-white transition-all duration-300 group"
        onClick={onClick}
      >
        <div className={`flex items-center justify-center gap-6 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Icon />
          <span className="font-changa text-xl font-semibold animate-[heart-beat_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            {language === 'ar' ? 'حمل تطبيق إكّـه الآن' : 'Download Ekka App'}
          </span>
        </div>
      </Button>
      <p className="text-sm text-muted-foreground text-center font-changa">
        حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك
      </p>
    </div>
  );
};
