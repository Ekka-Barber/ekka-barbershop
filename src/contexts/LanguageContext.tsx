import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Customer page
    'welcome': 'Welcome to',
    'ekka': 'Ekka Barbershop',
    'view.menu': 'View Menu',
    'special.offers': 'Special Offers',
    'book.now': 'Book Now',
    'select.branch': 'Select Branch',
    // Menu page
    'our.menu': 'Our Menu',
    'back.home': 'Back to Home',
    'loading.menu': 'Loading menu...',
    'no.menu': 'No menu available at the moment.',
    // Offers page
    'special.offers.title': 'Special Offers',
    'loading.offers': 'Loading offers...',
    'no.offers': 'No special offers available at the moment.',
    // Bookings page
    'book.appointment': 'Book Appointment',
    'booking.coming.soon': 'Online booking coming soon!',
    'available.barbers': 'barbers available',
    'no.barbers.available': 'No barbers available at this time',
    'next': 'Next',
    'previous': 'Previous',
    'confirm.booking': 'Confirm Booking',
    'total': 'Total',
    'name': 'Name',
    'phone': 'Phone',
    'email': 'Email',
    'notes': 'Notes',
    'booking.summary': 'Booking Summary'
  },
  ar: {
    // Customer page
    'welcome': 'مرحبا بك في',
    'ekka': 'صالون إكه للعناية بالرجل',
    'view.menu': 'قائمة الأسعار',
    'special.offers': 'العروض',
    'book.now': 'لحجز موعد',
    'select.branch': 'اختر الفرع',
    // Menu page
    'our.menu': 'قائمة الأسعار',
    'back.home': 'العودة للرئيسية',
    'loading.menu': 'جاري تحميل القائمة...',
    'no.menu': 'لا تتوفر قائمة حالياً.',
    // Offers page
    'special.offers.title': 'العروض',
    'loading.offers': 'جاري تحميل العروض...',
    'no.offers': 'لا تتوفر عروض خاصة حالياً.',
    // Bookings page
    'book.appointment': 'حجز موعد',
    'booking.coming.soon': 'الحجز عبر الإنترنت قريباً!',
    'available.barbers': 'حلاق متوفر',
    'no.barbers.available': 'لا يوجد حلاقين متوفرين حالياً',
    'next': 'التالي',
    'previous': 'السابق',
    'confirm.booking': 'تأكيد الحجز',
    'total': 'المجموع',
    'name': 'الاسم',
    'phone': 'رقم الجوال',
    'email': 'البريد الإلكتروني',
    'notes': 'ملاحظات',
    'booking.summary': 'ملخص الحجز'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
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
