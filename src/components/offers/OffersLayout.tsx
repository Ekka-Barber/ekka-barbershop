
import { useLanguage } from "@/contexts/LanguageContext";
import { OffersLanguageSwitcher } from "./OffersLanguageSwitcher";
import { ReactNode } from "react";

interface OffersLayoutProps {
  children: ReactNode;
}

export const OffersLayout = ({ children }: OffersLayoutProps) => {
  const { language } = useLanguage();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <div dir={language === 'ar' ? 'rtl' : 'ltr'} className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100">
          <OffersLanguageSwitcher />
          <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
            {children}
          </div>
        </div>
      </div>
      <footer className="page-footer" />
    </div>
  );
};
