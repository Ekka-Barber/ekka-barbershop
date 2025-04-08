import { useLanguage } from "@/contexts/LanguageContext";
export const ReviewsHeader = () => {
  const {
    language
  } = useLanguage();
  return <div className="text-center mb-6">
      <div className="inline-block">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-[#222222] relative">
          <span className="relative z-10">
            {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
          </span>
          <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#C4A36F]/20 transform -rotate-1 z-0"></span>
        </h2>
      </div>
      
    </div>;
};