import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
    'book.appointment': 'Book Appointment',
    'step.services': 'Services',
    'step.datetime': 'Date & Time',
    'step.barber': 'Barber',
    'step.details': 'Details',
    'welcome.line1': 'Welcome to',
    'welcome.line2': 'Ekka Barbershop',
    'view.menu': 'View Menu',
    'special.offers': 'Special Offers',
    'special.offers.title': 'Special Offers',
    'book.now': 'Book Now',
    'our.menu': 'Our Menu',
    'loading.menu': 'Loading menu...',
    'no.menu': 'No menu available',
    'loading.offers': 'Loading offers...',
    'no.offers': 'No offers available',
    'error.loading.offers': 'Error loading offers',
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
    'book.appointment': 'احجز موعد',
    'step.services': 'الخدمات',
    'step.datetime': 'التاريخ والوقت',
    'step.barber': 'الحلاق',
    'step.details': 'التفاصيل',
    'welcome.line1': 'مرحبًا بك في صالون',
    'welcome.line2': 'إكّه للعناية بالرجل',
    'view.menu': 'قائمة الأسعار',
    'special.offers': 'العروض',
    'special.offers.title': 'العروض',
    'book.now': 'احجز الآن',
    'our.menu': 'قائمتنا',
    'loading.menu': 'جاري تحميل القائمة...',
    'no.menu': 'لا توجد قائمة متاحة',
    'loading.offers': 'جاري تحميل العروض...',
    'no.offers': 'لا توجد عروض متاحة',
    'error.loading.offers': 'خطأ في تحميل العروض',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Update document direction based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    // Add/remove RTL class on body
    document.body.classList.toggle('rtl', language === 'ar');
  }, [language]);

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