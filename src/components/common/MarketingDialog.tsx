import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from '@/lib/motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { LazyPDFViewer } from '@/components/LazyPDFViewer';
import type { PDFFile } from '@/hooks/usePDFFetch';

export interface MarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'menu' | 'offers';
  initialContent?: PDFFile[];
  initialIndex?: number;
  isLoading?: boolean;
}

// Metadata display component
const ContentMetadata: React.FC<{
  content: PDFFile;
  language: string;
}> = ({ content, language }) => {

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? 'ar-SA-u-ca-gregory' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 p-3 sm:p-4 bg-gray-50 border-t border-gray-100">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Content type badge */}
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          {content.file_type.includes('pdf') ? (
            <FileText className="w-3 h-3" />
          ) : (
            <ImageIcon className="w-3 h-3" />
          )}
          <span className="hidden xs:inline">{content.file_type.toUpperCase()}</span>
        </Badge>

        {/* Branch badge */}
        {content.branchName && (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs px-2 py-1">
            {content.branchName}
          </Badge>
        )}

        {/* New/Updated badge */}
        {content.created_at && (
          <Badge
            variant="outline"
            className={`flex items-center gap-1 text-xs px-2 py-1 ${new Date(content.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
          >
            <Calendar className="w-3 h-3" />
            <span className="hidden xs:inline">
              {new Date(content.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000)
                ? 'New'
                : 'Updated'
              }
            </span>
          </Badge>
        )}

        {/* Date - hidden on very small screens */}
        {content.created_at && (
          <span className="text-xs text-gray-500 flex items-center gap-1 hidden sm:flex">
            <Calendar className="w-3 h-3" />
            {formatDate(content.created_at)}
          </span>
        )}
      </div>
    </div>
  );
};

// Content renderer component
const ContentRenderer: React.FC<{
  content: PDFFile;
}> = ({ content }) => {
  const { language } = useLanguage();

  if (content.file_type.includes('pdf')) {
    // Don't constrain height for PDFs - let pages grow naturally for scrolling
    return (
      <div className="relative w-full">
        <LazyPDFViewer
          pdfUrl={content.url}
          className="w-full"
          variant="dialog"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 rounded-xl overflow-auto">
      <img
        src={content.url}
        alt={content.file_name || (language === 'ar' ? 'محتوى تسويقي' : 'Marketing Content')}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
    </div>
  );
};

// Main MarketingDialog component
export const MarketingDialog: React.FC<MarketingDialogProps> = ({
  open,
  onOpenChange,
  contentType,
  initialContent = [],
  initialIndex = 0,
  isLoading = false
}) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initial index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const currentContent = initialContent[currentIndex];
  const hasContent = Boolean(currentContent);

  if (!hasContent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-full max-w-2xl flex items-center justify-center rounded-2xl border-0 bg-white p-0"
          style={{
            height: 'calc(70vh - var(--sat, 0px) - var(--sab, 0px))',
            maxHeight: 'calc(100vh - 4rem - var(--sat, 0px) - var(--sab, 0px))'
          }}
          showCloseButton
        >
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            {isLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-[#C4A36F]/30 border-t-[#C4A36F] rounded-full animate-spin" />
                <p className="text-sm text-[#555]">
                  {language === 'ar' ? 'جاري تحميل المحتوى...' : 'Loading marketing content...'}
                </p>
              </>
            ) : (
              <>
                <DialogTitle className="text-lg font-semibold text-[#222222]">
                  {language === 'ar' ? 'لا يوجد محتوى متاح حالياً' : 'No content available yet'}
                </DialogTitle>
                <DialogDescription className="text-sm text-[#555] text-center px-4">
                  {language === 'ar'
                    ? 'تحقق من لوحة التحكم للتأكد من نشر الملفات لهذا القسم.'
                    : 'Please verify in the dashboard that files are published for this section.'}
                </DialogDescription>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : initialContent.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < initialContent.length - 1 ? prev + 1 : 0));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full p-0 overflow-hidden max-w-6xl w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] mx-auto"
        style={{
          height: 'calc(90vh - var(--sat, 0px) - var(--sab, 0px))',
          maxHeight: 'calc(100vh - 4rem - var(--sat, 0px) - var(--sab, 0px))'
        }}
        showCloseButton
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: window.innerWidth < 768 ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: window.innerWidth < 768 ? 0 : -20 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col h-full"
          >
            {/* Header */}
            <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex-shrink-0">
              <DialogTitle className="sr-only">
                {contentType === 'menu'
                  ? (language === 'ar' ? 'قائمة الأسعار' : 'Menu')
                  : (language === 'ar' ? 'العروض' : 'Special Offers')
                }
              </DialogTitle>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-[#222222] truncate">
                    {contentType === 'menu'
                      ? (language === 'ar' ? 'قائمة الأسعار' : 'Menu')
                      : (language === 'ar' ? 'العروض' : 'Special Offers')
                    }
                  </h2>
                  {initialContent.length > 1 && (
                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                      {currentIndex + 1} / {initialContent.length}
                    </span>
                  )}
                </div>

                {/* Navigation buttons */}
                {initialContent.length > 1 && (
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10"
                      onClick={handlePrevious}
                      disabled={initialContent.length <= 1}
                      aria-label="Previous"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10"
                      onClick={handleNext}
                      disabled={initialContent.length <= 1}
                      aria-label="Next"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <DialogDescription className="sr-only">
                {contentType === 'menu'
                  ? (language === 'ar' ? 'عرض قائمة الأسعار' : 'View menu and pricing information')
                  : (language === 'ar' ? 'عرض العروض الحالية' : 'View special offers and promotions')
                }
              </DialogDescription>
            </DialogHeader>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 momentum-scroll" style={{ WebkitOverflowScrolling: 'touch' }}>
              <ContentRenderer
                content={currentContent}
              />
            </div>

            {/* Metadata footer */}
            <ContentMetadata
              content={currentContent}
              language={language}
            />
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
