
import { motion, AnimatePresence } from "framer-motion";
import GoogleReviews from "@/components/customer/GoogleReviews";

// Define the UI element type directly in the component
interface UIElement {
  id: string;
  type: string;
  name: string;
  display_name: string;
  is_visible?: boolean;
  [key: string]: any;
}

interface GoogleReviewsWrapperProps {
  element: UIElement;
  isVisible: boolean;
}

export const GoogleReviewsWrapper = ({ element, isVisible }: GoogleReviewsWrapperProps) => {
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
