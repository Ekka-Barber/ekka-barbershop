
import { useLanguage } from "@/contexts/LanguageContext";

export const ReviewsHeader = () => {
  const { language } = useLanguage();
  
  return (
    <div className="text-center mb-10">
      <div className="inline-block">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[#222222] relative">
          <span className="relative z-10">
            {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
          </span>
          <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#C4A36F]/20 transform -rotate-1 z-0"></span>
        </h2>
      </div>
      <p className="mt-4 text-gray-600 max-w-lg mx-auto">
        {language === 'ar' 
          ? 'اكتشف تجارب عملائنا الحقيقية وآرائهم الصادقة حول خدماتنا' 
          : 'Discover authentic experiences and honest feedback from our valued customers'}
      </p>
    </div>
  );
};
