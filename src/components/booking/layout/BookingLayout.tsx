
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ReactNode } from "react";

interface BookingLayoutProps {
  children: ReactNode;
}

export const BookingLayout = ({ children }: BookingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="app-header">
        <div className="language-switcher-container">
          <LanguageSwitcher />
        </div>
      </div>
      <div className="flex-grow max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
        <div className="content-area flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
      <footer className="page-footer" />
    </div>
  );
};
