
import { motion } from "framer-motion";

interface NoServicesSelectedProps {
  language: 'en' | 'ar';
}

export const NoServicesSelected = ({ language }: NoServicesSelectedProps) => {
  return (
    <motion.div 
      className="text-muted-foreground text-center py-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {language === 'ar' ? 'لم يتم اختيار أي خدمات' : 'No services selected'}
    </motion.div>
  );
};
