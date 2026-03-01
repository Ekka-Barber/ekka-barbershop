
import { motion, AnimatePresence } from "@shared/lib/motion";

import { useLanguage } from "@/contexts/LanguageContext";

interface CustomerHeaderProps {
  animatingElements: string[];
}

const logoVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const logoTransition = { duration: 0.6 };

const headingsVariants = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
};

const headingsTransition = { duration: 0.5 };

const dividerVariants = {
  initial: { scaleX: 0, opacity: 0 },
  animate: { scaleX: 1, opacity: 1 },
};

const dividerTransition = { duration: 0.5 };

export const CustomerHeader = ({ animatingElements }: CustomerHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="text-center flex-shrink-0 mx-auto pt-safe w-full">
      <AnimatePresence>
        {animatingElements.includes('logo') && (
          <motion.img
            key="logo"
            src="/logo_Header/header11.svg"
            alt="Ekka Barbershop Logo"
            className="h-28 md:h-32 mx-auto mb-4 md:mb-6 object-contain"
            loading="eager"
            fetchPriority="high"
            width="500"
            height="128"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp';
            }}
            initial={logoVariants.initial}
            animate={logoVariants.animate}
            transition={logoTransition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animatingElements.includes('headings') && (
          <motion.div 
            className="space-y-1 md:space-y-2"
            key="headings"
            initial={headingsVariants.initial}
            animate={headingsVariants.animate}
            transition={headingsTransition}
          >
            <h2 className="text-xl font-medium text-brand-gray-900">
              {t('welcome.line1')}
            </h2>
            <h1 className="text-2xl md:text-3xl font-bold text-brand-gray-900">
              {t('welcome.line2')}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {animatingElements.includes('divider') && (
          <motion.div 
            key="divider"
            className="h-1.5 w-24 bg-gradient-to-r from-brand-gold-200 via-brand-gold-300 to-brand-gold-400 mx-auto mt-3 md:mt-4 mb-6 shadow-[0_4px_20px_rgba(232,198,111,0.4)]"
            initial={dividerVariants.initial}
            animate={dividerVariants.animate}
            transition={dividerTransition}
            style={{ originX: 0.5 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
