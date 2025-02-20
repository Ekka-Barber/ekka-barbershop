
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export const OffersLanguageSwitcher = () => {
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-b from-gray-50 to-transparent h-11">
      <div className="max-w-md mx-auto h-full relative">
        <div className="absolute right-0 top-0 h-full" style={{ direction: 'ltr' }}>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};
