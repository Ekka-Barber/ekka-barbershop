
import { getIcon } from "@shared/lib/icons";
import { motion } from "@shared/lib/motion";
import { Tables } from "@shared/types/supabase";
import { Button } from "@shared/ui/components/button";

import { useLanguage } from "@/contexts/LanguageContext";


interface ActionButtonProps {
  element: Tables<'ui_elements'>;
  onClick: () => void;
}

export const ActionButton = ({ element, onClick }: ActionButtonProps) => {
  const { language } = useLanguage();
  
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = getIcon(iconName);
    return <Icon className="mr-2 h-5 w-5" />;
  };
  
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
  
  return (
    <motion.div
      className="rounded-2xl"
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.04, 
        y: -3,
        boxShadow: element.name === 'view_menu' || element.name === 'book_now' 
          ? "0 25px 50px -12px rgba(232,198,111,0.4), 0 15px 30px -10px rgba(214,179,90,0.3)" 
          : "0 25px 50px -12px rgba(0,0,0,0.3), 0 15px 30px -10px rgba(255,255,255,0.1)"
      }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <Button
        className={`w-full h-auto min-h-[60px] text-lg font-medium flex items-center justify-center px-5 py-4 ${
          element.name === 'view_menu' || element.name === 'book_now'
            ? 'bg-gradient-to-r from-[#f2d197] via-[#efc780] to-[#e39f26] hover:from-[#f2d197] hover:via-[#f2d197] hover:to-[#efc780] shadow-[0_20px_45px_-15px_rgba(232,198,111,0.5),0_10px_25px_-10px_rgba(214,179,90,0.3)]'
            : 'bg-gradient-to-br from-[#4A4A4A] via-[#3A3A3A] to-[#2A2A2A] hover:from-[#5A5A5A] hover:via-[#4A4A4A] hover:to-[#3A3A3A] shadow-[0_20px_45px_-15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)]'
        } text-white transition-all duration-300 border-2 ${
          element.name === 'view_menu' || element.name === 'book_now'
            ? 'border-[#f2d197]/30'
            : 'border-white/10'
        } backdrop-blur-sm rounded-2xl touch-target`}
        onClick={onClick}
      >
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={element.name === 'view_menu' || element.name === 'book_now' ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]' : ''}
        >
          {renderIcon(element.icon)}
        </motion.div>
        <div className="flex flex-col text-center">
          <span className={`text-lg font-semibold ${
            element.name === 'view_menu' || element.name === 'book_now' 
              ? 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]' 
              : ''
          }`}>
            {language === 'ar' ? element.display_name_ar : element.display_name}
          </span>
          {element.description && (
            <span className="text-xs font-normal text-gray-100/90 mt-1">
              {language === 'ar' ? element.description_ar : element.description}
            </span>
          )}
        </div>
      </Button>
    </motion.div>
  );
};
