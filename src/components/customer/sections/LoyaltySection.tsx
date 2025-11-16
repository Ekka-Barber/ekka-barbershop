
import { useLanguage } from "@/contexts/LanguageContext";
import { Tables } from "@/types/supabase";
import { motion } from "@/lib/motion";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { Separator } from "@/components/ui/separator";
import boonusLogo from "@/assets/boonus-logo.svg";

interface LoyaltySectionProps {
  element: Tables<'ui_elements'>;
  isVisible: boolean;
}

export const LoyaltySection = ({ element, isVisible }: LoyaltySectionProps) => {
  const { language } = useLanguage();
  
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  const handleLoyaltyClick = () => {
    trackButtonClick({
      buttonId: 'loyalty_program',
      buttonName: language === 'ar' ? element.display_name_ar : element.display_name
    });
    window.open('https://enroll.boonus.app/64b7c34953090f001de0fb6c/wallet/64b7efed53090f001de815b4', '_blank');
  };
  
  if (!isVisible) {
    return null;
  }

  return (
    <>
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          scale: 1.02, 
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        onClick={handleLoyaltyClick}
        role="button"
        tabIndex={0}
        aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLoyaltyClick(); }}
      >
        <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
              <h2 className={`text-lg font-bold text-[#222222] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? element.display_name_ar : element.display_name}
              </h2>
              {element.description && (
                <p className={`text-gray-600 text-xs mt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? element.description_ar : element.description}
                </p>
              )}
            </div>
            <div className="h-10 w-px bg-gray-200 mx-3"></div>
            <motion.div 
              className="flex-shrink-0 flex flex-col items-center justify-center"
              whileHover={{ y: -2, rotate: -2 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <img src={boonusLogo} alt="Boonus Logo" className="h-8 w-auto" />
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="w-full max-w-xs mx-auto my-4"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <Separator
          orientation="horizontal"
          className="bg-[#C4A36F]/30 h-[1px] w-full"
        />
      </motion.div>
    </>
  );
};

export default LoyaltySection;
