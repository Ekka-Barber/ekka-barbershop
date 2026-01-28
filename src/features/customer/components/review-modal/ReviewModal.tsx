import { Star, MapPin, Quote } from 'lucide-react';

import { motion } from '@shared/lib/motion';
import { Review } from '@shared/services/reviewsService';
import { Language } from '@shared/types/language';
import { Button } from "@shared/ui/components/button";
import { CachedAvatar } from "@shared/ui/components/cached-avatar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@shared/ui/components/dialog";

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
      <DialogContent
        className="max-h-[80vh] overflow-y-auto momentum-scroll custom-scrollbar sm:max-w-xl p-0 border-2 border-white/40 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),0_20px_50px_-20px_rgba(196,163,111,0.2)] rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/98 to-white/95"
        style={{ WebkitOverflowScrolling: 'touch' }}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">
          {language === 'ar' ? 'تقييم العميل' : 'Customer Review'}
        </DialogTitle>
        {/* Decorative header with gradient */}
        <motion.div 
          className="bg-gradient-to-r from-brand-gray-500 via-brand-gray-600 to-brand-gold-200 px-6 py-6 rounded-t-2xl relative overflow-hidden shadow-[0_10px_40px_-10px_rgba(232,198,111,0.3)]"
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
                  <Star className="w-5 h-5 fill-brand-gold-400 text-brand-gold-400 drop-shadow-[0_2px_6px_rgba(232,198,111,0.4)]" />
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
              <CachedAvatar
                googleAvatarUrl={selectedReview.profile_photo_url || null}
                cachedAvatarUrl={selectedReview.cached_avatar_url || null}
                authorName={selectedReview.author_name}
                className="w-13 h-13 border-2 border-brand-gold-200/30 mr-3 shadow-[0_4px_12px_-4px_rgba(232,198,111,0.3)]"
                fallbackClassName="bg-gradient-to-br from-brand-gold-200/20 to-brand-gold-300/10 text-brand-gold-400"
                size={52}
              />
              <div>
                <h3 className="font-bold text-brand-gray-900 drop-shadow-[0_1px_3px_rgba(0,0,0,0.08)]">{selectedReview.author_name}</h3>
                <p className="text-xs text-brand-gray-500 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-brand-gold-400 drop-shadow-[0_2px_4px_rgba(232,198,111,0.3)]" />
                  {language === 'ar' ? selectedReview.branch_name_ar : selectedReview.branch_name}
                </p>
              </div>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-brand-gray-500/[0.03] to-brand-gold-200/[0.03] p-5 rounded-2xl border-2 border-brand-gold-200/15 relative shadow-[0_10px_25px_-10px_rgba(232,198,111,0.1),inset_0_1px_2px_rgba(255,255,255,0.5)] backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Quote className="absolute text-brand-gold-400/20 w-11 h-11 -top-2 -left-2 transform -rotate-180 drop-shadow-[0_2px_8px_rgba(232,198,111,0.2)]" />
              <DialogDescription className="whitespace-pre-wrap text-brand-gray-800 leading-relaxed relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
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
            <motion.div 
              className="rounded-2xl"
              whileHover={{ scale: 1.04, y: -2 }} 
              whileTap={{ scale: 0.98, y: 0 }}
            >
              <Button 
                onClick={() => onClose()} 
                className="bg-gradient-to-r from-brand-gray-500 via-brand-gray-600 to-brand-gold-200 hover:from-brand-gray-600 hover:via-brand-gray-700 hover:to-brand-gold-300 text-white shadow-[0_15px_35px_-10px_rgba(232,198,111,0.4)] hover:shadow-[0_20px_45px_-10px_rgba(232,198,111,0.5)] font-medium rounded-2xl"
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
