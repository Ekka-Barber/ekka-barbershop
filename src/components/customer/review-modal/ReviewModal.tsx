import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';
import { Language } from '@/types/language';
import { Review } from '../hooks/useReviews';
import { motion } from 'framer-motion';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReview: Review | null;
  language: Language;
}

export const ReviewModal = ({ isOpen, onClose, selectedReview, language }: ReviewModalProps) => {
  if (!selectedReview) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {selectedReview.author_name}
            </motion.div>
            <motion.div 
              className="flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {[...Array(selectedReview.rating || 5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.2 + (i * 0.1),
                    type: "spring",
                    stiffness: 300,
                    damping: 15
                  }}
                >
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                </motion.div>
              ))}
            </motion.div>
          </DialogTitle>
          <motion.p 
            className="text-xs text-gray-500 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {language === 'ar' ? selectedReview.branch_name_ar : selectedReview.branch_name}
          </motion.p>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <DialogDescription className="mt-4 whitespace-pre-wrap text-gray-700">
            {selectedReview.text}
          </DialogDescription>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
        >
          <Button 
            onClick={() => onClose()} 
            className="mt-4 w-full sm:w-auto sm:ml-auto bg-[#C4A36F] hover:bg-[#A3845A]"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
