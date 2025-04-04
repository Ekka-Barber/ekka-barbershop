
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from 'lucide-react';
import { Language } from '@/types/language';
import { Review } from '../hooks/useReviews';

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
            <div className="flex-1">{selectedReview.author_name}</div>
            <div className="flex items-center">
              {[...Array(selectedReview.rating || 5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
              ))}
            </div>
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1">
            {language === 'ar' ? selectedReview.branch_name_ar : selectedReview.branch_name}
          </p>
        </DialogHeader>
        <DialogDescription className="mt-4 whitespace-pre-wrap text-gray-700">
          {selectedReview.text}
        </DialogDescription>
        <Button 
          onClick={() => onClose()} 
          className="mt-4 w-full sm:w-auto sm:ml-auto bg-[#C4A36F] hover:bg-[#A3845A]"
        >
          {language === 'ar' ? 'إغلاق' : 'Close'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
