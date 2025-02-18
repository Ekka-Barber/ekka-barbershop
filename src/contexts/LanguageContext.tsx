
import React from 'react';

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
    'service.remove': 'Remove Service'
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
    'service.remove': 'إزالة الخدمة'
  }
};

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = React.useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  React.useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', language === 'ar');
  }, [language]);

  const value = React.useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = React.useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
