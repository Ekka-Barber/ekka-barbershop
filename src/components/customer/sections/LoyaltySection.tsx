import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { trackButtonClick } from "@/utils/tiktokTracking";
import { Gift } from "lucide-react";

interface UIElement {
  id: string;
  type: string;
  name: string;
  display_name: string;
  display_name_ar?: string;
  description?: string;
  description_ar?: string;
  icon?: string;
  is_visible?: boolean;
  [key: string]: any;
}

interface LoyaltySectionProps {
  element: UIElement;
  isVisible: boolean;
  onOpenLoyaltyDialog: () => void;
}

export const LoyaltySection = ({ element, isVisible, onOpenLoyaltyDialog }: LoyaltySectionProps) => {
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
    onOpenLoyaltyDialog();
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
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
                className="flex-shrink-0 bg-amber-50 p-2 rounded-full"
                whileHover={{ rotate: 15 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <Gift className="h-6 w-6 text-amber-500" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
