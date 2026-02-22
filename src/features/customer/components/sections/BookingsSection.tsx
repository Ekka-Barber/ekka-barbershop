
import { motion } from "@shared/lib/motion";
import { Tables } from "@shared/types/supabase";
import { trackButtonClick } from "@shared/utils/tiktokTracking";

import freshaLogo from "@/assets/fresha-logo.svg";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingsSectionProps {
  element: Tables<'ui_elements'>;
  isVisible: boolean;
  onOpenBookingsDialog: () => void;
}

const BookingsSection = ({ element, isVisible, onOpenBookingsDialog }: BookingsSectionProps) => {
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
  
  const handleBookingsClick = () => {
    trackButtonClick({
      buttonId: 'bookings',
      buttonName: language === 'ar' ? element.display_name_ar : element.display_name
    });
    onOpenBookingsDialog();
  };
  
  if (!isVisible) {
    return null;
  }

  return (
<motion.div
      className="rounded-2xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-400 focus-visible:ring-offset-2"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.03, 
        y: -4,
        boxShadow: "0 25px 50px -12px rgba(232,198,111,0.35), 0 15px 30px -10px rgba(214,179,90,0.25)" 
      }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={handleBookingsClick}
      role="button"
      tabIndex={0}
      aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBookingsClick(); }}
    >
      <div className="mt-3 bg-gradient-to-br from-white/95 via-white/90 to-white/85 rounded-2xl shadow-[0_20px_45px_-15px_rgba(0,0,0,0.15),0_10px_25px_-10px_rgba(214,179,90,0.1)] border-2 border-white/40 p-5 cursor-pointer hover:border-brand-gold-200/30 transition-all duration-300 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
            <h2 className={`text-lg font-bold text-brand-gray-900 mb-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? element.display_name_ar : element.display_name}
            </h2>
            {element.description && (
              <p className={`text-brand-gray-600 text-sm font-medium ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? element.description_ar : element.description}
              </p>
            )}
          </div>
          <div className="h-12 w-[2px] bg-gradient-to-b from-brand-gold-200/40 via-brand-gold-300/30 to-transparent mx-4 shadow-[0_0_10px_rgba(232,198,111,0.2)]"></div>
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ y: -3, rotate: 3, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <img src={freshaLogo} alt="Fresha Logo" className="h-9 w-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingsSection;
