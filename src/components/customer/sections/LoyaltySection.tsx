
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

const LoyaltySection = ({ element, isVisible }: LoyaltySectionProps) => {
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
        className="rounded-2xl"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ 
          scale: 1.03, 
          y: -4,
          boxShadow: "0 25px 50px -12px rgba(100,180,255,0.3), 0 15px 30px -10px rgba(59,130,246,0.2)" 
        }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        onClick={handleLoyaltyClick}
        role="button"
        tabIndex={0}
        aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLoyaltyClick(); }}
      >
        <div className="mt-3 bg-gradient-to-br from-white/95 via-white/90 to-white/85 rounded-2xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.15),0_10px_25px_-10px_rgba(59,130,246,0.1)] border-2 border-white/40 p-5 cursor-pointer hover:border-blue-300/40 transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
              <h2 className={`text-lg font-bold text-[#1a1a1a] mb-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? element.display_name_ar : element.display_name}
              </h2>
              {element.description && (
                <p className={`text-[#4a4a4a] text-sm font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? element.description_ar : element.description}
                </p>
              )}
            </div>
            <div className="h-12 w-[2px] bg-gradient-to-b from-blue-400/40 via-blue-300/30 to-transparent mx-4 shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
            <motion.div 
              className="flex-shrink-0 flex flex-col items-center justify-center"
              whileHover={{ y: -3, rotate: -3, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <img src={boonusLogo} alt="Boonus Logo" className="h-9 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div 
        className="w-full max-w-xs mx-auto my-6"
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
      >
        <Separator
          orientation="horizontal"
          className="bg-gradient-to-r from-transparent via-[#E8C66F]/40 to-transparent h-[2px] shadow-[0_0_15px_rgba(232,198,111,0.25)] w-full"
        />
      </motion.div>
    </>
  );
};

export default LoyaltySection;
