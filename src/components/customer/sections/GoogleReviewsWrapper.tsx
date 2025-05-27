
import { motion, AnimatePresence } from "framer-motion";
import GoogleReviews from "@/components/customer/GoogleReviews";

interface GoogleReviewsWrapperProps {
  isVisible: boolean;
}

export const GoogleReviewsWrapper = ({ isVisible }: GoogleReviewsWrapperProps) => {
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
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <GoogleReviews />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
