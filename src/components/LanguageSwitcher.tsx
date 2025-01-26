import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-4 fixed top-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
      <span className={`text-sm font-medium min-w-[24px] text-center ${language === 'en' ? 'text-primary font-bold' : 'text-gray-600'}`}>
        EN
      </span>
      <Switch
        checked={language === 'ar'}
        onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-sm font-medium min-w-[32px] text-center ${language === 'ar' ? 'text-primary font-bold' : 'text-gray-600'}`}>
        عربي
      </span>
    </div>
  );
};