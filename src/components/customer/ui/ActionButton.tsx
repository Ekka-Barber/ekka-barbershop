
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import type { Tables } from "@/types/supabase";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  element: Tables<'ui_elements'>;
  onClick: () => void;
}

export const ActionButton = ({ element, onClick }: ActionButtonProps) => {
  const { language } = useLanguage();
  
  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null;
    const Icon = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return Icon ? <Icon className="mr-2 h-5 w-5" /> : null;
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
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)" 
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        className={`w-full h-auto min-h-[56px] text-lg font-medium flex items-center justify-center px-4 py-3 ${
          element.name === 'view_menu' || element.name === 'book_now'
            ? 'bg-[#C4A36F] hover:bg-[#B39260]'
            : 'bg-[#4A4A4A] hover:bg-[#3A3A3A]'
        } text-white transition-all duration-300 shadow-lg hover:shadow-xl touch-target`}
        onClick={onClick}
      >
        <motion.div 
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {renderIcon(element.icon)}
        </motion.div>
        <div className="flex flex-col text-center">
          <span className="text-lg font-medium">
            {language === 'ar' ? element.display_name_ar : element.display_name}
          </span>
          {element.description && (
            <span className="text-xs font-normal text-gray-200 mt-1">
              {language === 'ar' ? element.description_ar : element.description}
            </span>
          )}
        </div>
      </Button>
    </motion.div>
  );
};
