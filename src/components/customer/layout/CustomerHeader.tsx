
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "@/lib/motion";

interface CustomerHeaderProps {
  animatingElements: string[];
}

export const CustomerHeader = ({ animatingElements }: CustomerHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center flex-shrink-0 mx-auto pt-safe w-full">
      <AnimatePresence>
        {animatingElements.includes('logo') && (
          <motion.img 
            key="logo"
            src="/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png" 
            alt="Ekka Barbershop Logo" 
            className="h-28 md:h-32 mx-auto mb-4 md:mb-6 object-contain"
            loading="eager"
            width="320" 
            height="128"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animatingElements.includes('headings') && (
          <motion.div 
            className="space-y-1 md:space-y-2"
            key="headings"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-xl font-medium text-[#222222]">
              {t('welcome.line1')}
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold text-[#222222]">
              {t('welcome.line2')}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animatingElements.includes('divider') && (
          <motion.div 
            key="divider"
            className="h-1.5 w-24 bg-gradient-to-r from-[#E8C66F] via-[#D6B35A] to-[#C4A36F] mx-auto mt-3 md:mt-4 mb-6 shadow-[0_4px_20px_rgba(232,198,111,0.4)]"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ originX: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
