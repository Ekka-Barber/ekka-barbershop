
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
    'step.datetime': 'Date',
    'step.barber': 'Barber & Time',
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
    'barber.available.now': 'Available Now',
    'barber.available.today': 'Available Today',
    'barber.not.available': 'Not Available',
    'loyalty.program': 'Join loyalty program',
    'our.branches': 'Our Branches',
    'no.time.slots': 'No available time slots for this day',
    'show.more': 'Show More',
    'show.less': 'Show Less',
    'processing': 'Processing...',
    'confirm.details': 'Confirm Details',
    'unconfirmed': 'Unconfirmed',
    'booking.alert': 'Alert',
    'enter.name': 'Please enter your name',
    'enter.valid.phone': 'Please enter a valid phone number',
    'enter.valid.email': 'Please enter a valid email',
    'select.date.time': 'Please select date and time',
    'whatsapp.missing': 'WhatsApp number is missing',
    'whatsapp.opened': 'WhatsApp opened to confirm your booking',
    'error.whatsapp': 'Error opening WhatsApp',
    'optional': 'optional',
    'discount': 'Discount',
    'services.selected': 'services selected',
    'no.services': 'No services selected',
    'booking.unconfirmed': 'This booking is',
    'booking.unconfirmed.status': 'not confirmed',
    'notification.purpose': 'for appointment notifications',
    'service.add': 'Add Service',
    'service.remove': 'Remove Service',
    'install.app': 'Install App',
    'install.app.download': 'Download Ekka App',
    'install.app.benefits': 'Faster bookings, exclusive offers, and extra benefits await you',
    'install.guide.description.ios': 'To install this app on your iPhone/iPad:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Confirm by tapping "Add"',
    'install.guide.description.android': 'Follow the browser prompts to install the app on your device',
    'install.guide.description.desktop': 'Click Install to add this app to your device',
    'install': 'Install',
    'cancel': 'Cancel',
    'installing': 'Installing...',
    'install.error': 'Installation failed. Please try again.',
    'install.success': 'App installed successfully!',
    'install.guide.title': 'Install Application'
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
    'step.datetime': 'التاريخ',
    'step.barber': 'الحلاق والوقت',
    'step.details': 'التفاصيل',
    'welcome.line1': 'مرحبًا بك في صالون',
    'welcome.line2': 'إكّه للعناية بالرجل',
    'view.menu': 'قائمة الأسعار',
    'special.offers': 'العروض',
    'special.offers.title': 'العروض',
    'book.now': 'لحجز موعد',
    'our.menu': 'قائمة الأسعار',
    'loading.menu': 'جاري تحميل القائمة...',
    'no.menu': 'لا توجد قائمة متاحة',
    'loading.offers': 'جاري تحميل العروض...',
    'no.offers': 'لا توجد عروض متاحة',
    'error.loading.offers': 'خطأ في تحميل العروض',
    'barber.available.now': 'متاح الآن',
    'barber.available.today': 'متاح اليوم',
    'barber.not.available': 'غير متاح',
    'loyalty.program': 'انضم لبرنامج الولاء',
    'our.branches': 'فروعنا',
    'no.time.slots': 'لا توجد مواعيد متاحة في هذا اليوم',
    'show.more': 'المزيد',
    'show.less': 'عرض أقل',
    'processing': 'جاري المعالجة...',
    'confirm.details': 'تأكيد تفاصيل الحجز',
    'unconfirmed': 'غير مؤكد',
    'booking.alert': 'تنبيه',
    'enter.name': 'الرجاء إدخال الاسم',
    'enter.valid.phone': 'الرجاء إدخال رقم هاتف صحيح',
    'enter.valid.email': 'الرجاء إدخال بريد إلكتروني صحيح',
    'select.date.time': 'الرجاء اختيار التاريخ والوقت',
    'whatsapp.missing': 'رقم الواتساب غير متوفر',
    'whatsapp.opened': 'تم فتح واتساب لتأكيد حجزك',
    'error.whatsapp': 'حدث خطأ أثناء فتح واتساب',
    'optional': 'اختياري',
    'discount': 'الخصم',
    'services.selected': 'خدمات مختارة',
    'no.services': 'لم يتم اختيار أي خدمات',
    'booking.unconfirmed': 'حجزك هذا',
    'booking.unconfirmed.status': 'غير مؤكد',
    'notification.purpose': 'لغرض تنبيهات الحجز',
    'service.add': 'إضافة الخدمة',
    'service.remove': 'إزالة الخدمة',
    'install.app': 'تثبيت التطبيق',
    'install.app.download': 'حمل تطبيق إكّـه الآن',
    'install.app.benefits': 'حجوزات أسرع، عروض حصرية، ومزايا إضافية بانتظارك',
    'install.guide.description.ios': 'لتثبيت التطبيق على الآيفون/الآيباد:\n١. اضغط على زر المشاركة\n٢. مرر لأسفل واضغط على "إضافة إلى الشاشة الرئيسية"\n٣. اضغط "إضافة" للتأكيد',
    'install.guide.description.android': 'اتبع تعليمات المتصفح لتثبيت التطبيق على جهازك',
    'install.guide.description.desktop': 'انقر على تثبيت لإضافة هذا التطبيق إلى جهازك',
    'install': 'تثبيت',
    'cancel': 'إلغاء',
    'installing': 'جاري التثبيت...',
    'install.error': 'فشل التثبيت. الرجاء المحاولة مرة أخرى.',
    'install.success': 'تم تثبيت التطبيق بنجاح!',
    'install.guide.title': 'تثبيت التطبيق'
  }
};

// Create the context with a default value
const LanguageContext = createContext<LanguageContextType>({
  language: 'ar',
  setLanguage: () => {},
  t: (key: string) => key,
});

// Helper function to detect system language
const detectSystemLanguage = (): Language => {
  const systemLanguages = navigator.languages || [navigator.language];
  
  // Check if any of the system languages start with 'ar'
  const hasArabic = systemLanguages.some(lang => 
    lang.toLowerCase().startsWith('ar')
  );
  
  return hasArabic ? 'ar' : 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Initialize with system language
    return detectSystemLanguage();
  });

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
    
    // Update manifest metadata based on language
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const currentHref = manifestLink.getAttribute('href');
      const newHref = currentHref?.includes('?') 
        ? `${currentHref}&lang=${language}`
        : `${currentHref}?lang=${language}`;
      manifestLink.setAttribute('href', newHref);
    }
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
