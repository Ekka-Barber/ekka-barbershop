import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Quote } from 'lucide-react';
import { Language } from '@/types/language';
import { Review } from '../hooks/useReviews';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReview: Review | null;
  language: Language;
}

export const ReviewModal = ({ isOpen, onClose, selectedReview, language }: ReviewModalProps) => {
  if (!selectedReview) return null;
  
  const isRTL = language === 'ar';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 sm:max-w-xl p-0 border-0 shadow-xl rounded-xl" showCloseButton={false}>
        {/* Decorative header with gradient */}
        <motion.div 
          className="bg-gradient-to-r from-[#4c4c4c] via-[#333333] to-[#C4A36F] px-6 py-5 rounded-t-xl relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div 
            className="absolute inset-0 w-full h-full opacity-10"
            initial={{ backgroundPosition: '0% 0%' }}
            animate={{ backgroundPosition: '100% 100%' }}
            transition={{ duration: 30, repeat: Infinity, repeatType: "reverse" }}
            style={{ 
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23ffffff\' fill-opacity=\'1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' 
            }}
          />
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex items-center justify-between relative z-10"
          >
            <div className="text-white font-semibold text-lg">
              {isRTL ? 'تقييم العميل' : 'Customer Review'}
            </div>
            <div className="flex items-center space-x-1">
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
                  <Star className="w-5 h-5 fill-[#C4A36F] text-[#C4A36F]" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
        
        <div className="px-6 py-5">
          <div className="mb-6">
            <motion.div 
              className="flex items-center mb-3"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Avatar className="w-12 h-12 border-2 border-[#C4A36F]/20 mr-3">
                <AvatarImage src={selectedReview.profile_photo_url} alt={selectedReview.author_name} className="object-cover" />
                <AvatarFallback className="bg-[#C4A36F]/10 text-[#C4A36F]">
                  {selectedReview.author_name ? selectedReview.author_name.charAt(0).toUpperCase() : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-gray-800">{selectedReview.author_name}</h3>
                <p className="text-xs text-gray-500 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1 text-[#C4A36F]" />
                  {language === 'ar' ? selectedReview.branch_name_ar : selectedReview.branch_name}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-[#4c4c4c]/5 p-4 rounded-lg border border-[#C4A36F]/10 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Quote className="absolute text-[#C4A36F]/20 w-10 h-10 -top-2 -left-2 transform -rotate-180" />
              <DialogDescription className="whitespace-pre-wrap text-gray-700 leading-relaxed relative z-10">
                {selectedReview.text}
              </DialogDescription>
            </motion.div>
          </div>
          
          <motion.div
            className="flex justify-end items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                onClick={() => onClose()} 
                className="bg-gradient-to-r from-[#4c4c4c] to-[#C4A36F] hover:from-[#3a3a3a] hover:to-[#b38f5d] text-white shadow-sm"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
