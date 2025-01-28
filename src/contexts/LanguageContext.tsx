import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'select.branch': 'Select a Branch',
    'go.back': 'Go Back',
    'back.home': 'Back to Home',
    'previous': 'Previous',
    'next': 'Next',
    'confirm.booking': 'Confirm Booking',
    'booking.summary': 'Booking Summary',
    'total': 'Total',
    'name': 'Name',
    'phone': 'Phone',
    'email': 'Email',
    'notes': 'Notes',
    'select.date': 'Select Date',
    'select.time': 'Select Time',
    'select.barber': 'Select Barber',
    'total.duration': 'Total Duration',
    'minutes': 'minutes',
    'date.time': 'Date & Time',
    'barber': 'Barber',
  },
  ar: {
    'select.branch': 'اختر فرعاً',
    'go.back': 'رجوع',
    'back.home': 'العودة للرئيسية',
    'previous': 'السابق',
    'next': 'التالي',
    'confirm.booking': 'تأكيد الحجز',
    'booking.summary': 'ملخص الحجز',
    'total': 'المجموع',
    'name': 'الاسم',
    'phone': 'رقم الجوال',
    'email': 'البريد الإلكتروني',
    'notes': 'ملاحظات',
    'select.date': 'اختر التاريخ',
    'select.time': 'اختر الوقت',
    'select.barber': 'اختر الحلاق',
    'total.duration': 'المدة الإجمالية',
    'minutes': 'دقائق',
    'date.time': 'التاريخ والوقت',
    'barber': 'الحلاق',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};