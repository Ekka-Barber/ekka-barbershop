import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-6 fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-gray-100">
      <span className={`text-sm font-medium min-w-[24px] text-center transition-colors ${language === 'en' ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
        EN
      </span>
      <Switch
        checked={language === 'ar'}
        onCheckedChange={(checked) => setLanguage(checked ? 'ar' : 'en')}
        className="data-[state=checked]:bg-primary"
      />
      <span className={`text-sm font-medium min-w-[32px] text-center transition-colors ${language === 'ar' ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
        عربي
      </span>
    </div>
  );
};