
import { useLanguage } from "@/contexts/LanguageContext";
import { Tables } from "@/types/supabase";
import { motion } from "@/lib/motion";
import { trackButtonClick } from "@/utils/tiktokTracking";
import freshaLogo from "@/assets/fresha-logo.svg";

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
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.02, 
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={handleBookingsClick}
      role="button"
      tabIndex={0}
      aria-label={language === 'ar' ? element.display_name_ar : element.display_name}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBookingsClick(); }}
    >
      <div className="mt-3 bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className={`flex-1 ${language === 'ar' ? 'ml-3' : 'mr-3'}`}>
            <h2 className={`text-lg font-bold text-[#222222] mb-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {language === 'ar' ? element.display_name_ar : element.display_name}
            </h2>
            {element.description && (
              <p className={`text-gray-600 text-xs ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                {language === 'ar' ? element.description_ar : element.description}
              </p>
            )}
          </div>
          <div className="h-10 w-px bg-gray-200 mx-3"></div>
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ y: -2, rotate: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <img src={freshaLogo} alt="Fresha Logo" className="h-8 w-auto" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookingsSection;
