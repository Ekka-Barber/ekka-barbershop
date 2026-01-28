import { motion } from "@shared/lib/motion";

import { useLanguage } from "@/contexts/LanguageContext";

export const ReviewsHeader = () => {
  const { language } = useLanguage();
  
  return (
    <div className="text-center mb-6">
      <motion.div 
        className="inline-block"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-gray-900 relative">
          <motion.span 
            className="relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {language === 'ar' ? 'آراء عملائنا' : 'What Our Clients Say'}
          </motion.span>
          <motion.span 
            className="absolute -bottom-2 left-0 right-0 h-3 bg-brand-gold-200/20 transform -rotate-1 z-0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: 0.4,
              ease: "easeOut"
            }}
            style={{ originX: language === 'ar' ? 1 : 0 }}
          />
        </h2>
      </motion.div>
    </div>
  );
};
