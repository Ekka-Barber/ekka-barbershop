import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import type { PDFFile } from '@shared/hooks/usePDFFetch';
import { motion, AnimatePresence } from '@shared/lib/motion';
import { LazyPDFViewer } from '@shared/lib/pdf/LazyPDFViewer';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@shared/ui/components/sheet';

import { useLanguage } from '@/contexts/LanguageContext';


export interface MarketingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: 'menu' | 'offers';
  initialContent?: PDFFile[];
  initialIndex?: number;
  isLoading?: boolean;
}

// Metadata display component - compact, brand-aligned
const ContentMetadata: React.FC<{
  content: PDFFile;
  language: string;
}> = ({ content, language }) => {
  const isNew = content.created_at && 
    new Date(content.created_at).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 bg-brand-gold-50" style={{ height: '25px', paddingTop: 0, paddingBottom: 0 }}>
      {/* Content type badge */}
      <Badge 
        variant="secondary" 
        className="flex items-center gap-1 text-xs bg-white border border-brand-gold-100 text-brand-gold-600"
      >
        {content.file_type.includes('pdf') ? (
          <FileText className="w-3 h-3" />
        ) : (
          <ImageIcon className="w-3 h-3" />
        )}
        {content.file_type.toUpperCase().replace('APPLICATION/', '')}
      </Badge>

      {/* New badge - only show if new */}
      {isNew && (
        <Badge
          variant="outline"
          className="flex items-center gap-1 text-xs bg-brand-gold-200/10 text-brand-gold-600 border-brand-gold-300/30"
        >
          <Calendar className="w-3 h-3" />
          {language === 'ar' ? 'جديد' : 'New'}
        </Badge>
      )}
    </div>
  );
};

// Content renderer component - fills available space, single scroll context
const ContentRenderer: React.FC<{
  content: PDFFile;
}> = ({ content }) => {
  const { language } = useLanguage();

  if (content.file_type.includes('pdf')) {
    return (
      <LazyPDFViewer
        pdfUrl={content.url}
        className="w-full h-full"
        variant="dialog"
      />
    );
  }

  // Image content - scrollable container with custom scrollbar
  return (
    <div
      className="relative w-full h-full overflow-auto custom-scrollbar momentum-scroll bg-brand-gold-50"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <img
        src={content.url}
        alt={content.file_name || (language === 'ar' ? 'محتوى تسويقي' : 'Marketing Content')}
        className="w-full h-auto object-contain"
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
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex items-center justify-center rounded-t-2xl bg-white pb-[calc(var(--sab)+1rem)] sm:max-w-2xl sm:mx-auto sm:rounded-2xl"
          style={{
            height: 'calc(70vh - var(--sat, 0px) - var(--sab, 0px))',
            maxHeight: 'calc(100vh - 4rem - var(--sat, 0px) - var(--sab, 0px))'
          }}
        >
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            {isLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-brand-gold-300/30 border-t-brand-gold-400 rounded-full animate-spin" />
                <p className="text-sm text-brand-gray-600">
                  {language === 'ar' ? 'جاري تحميل المحتوى...' : 'Loading marketing content...'}
                </p>
              </>
            ) : (
              <>
                <SheetTitle className="text-lg font-semibold text-brand-gray-900">
                  {language === 'ar' ? 'لا يوجد محتوى متاح حالياً' : 'No content available yet'}
                </SheetTitle>
                <SheetDescription className="text-sm text-brand-gray-600 text-center px-4">
                  {language === 'ar'
                    ? 'تحقق من لوحة التحكم للتأكد من نشر الملفات لهذا القسم.'
                    : 'Please verify in the dashboard that files are published for this section.'}
                </SheetDescription>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : initialContent.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < initialContent.length - 1 ? prev + 1 : 0));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 max-w-4xl w-full mx-auto rounded-t-2xl overflow-hidden bg-brand-gold-50"
        style={{
          height: '85vh',
          maxHeight: 'calc(100dvh - 2rem)'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex flex-col h-full"
          >
            {/* Compact Header */}
            <SheetHeader className="px-4 py-2.5 border-b border-brand-gold-100/50 flex-shrink-0 bg-white" style={{ height: '45px' }}>
              <VisuallyHidden>
                <SheetTitle>
                  {contentType === 'menu'
                    ? (language === 'ar' ? 'قائمة الأسعار' : 'Menu')
                    : (language === 'ar' ? 'العروض' : 'Special Offers')
                  }
                </SheetTitle>
              </VisuallyHidden>
              <SheetDescription className="sr-only">
                {contentType === 'menu'
                  ? (language === 'ar' ? 'عرض قائمة الأسعار والأسعار' : 'View menu and pricing information')
                  : (language === 'ar' ? 'عرض العروض والخصومات الحالية' : 'View current special offers and promotions')
                }
              </SheetDescription>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-brand-gray-900">
                  {contentType === 'menu'
                    ? (language === 'ar' ? 'قائمة الأسعار' : 'Menu')
                    : (language === 'ar' ? 'العروض' : 'Special Offers')
                  }
                </h2>
                {initialContent.length > 1 && (
                  <span className="text-xs text-brand-gold-600 font-medium">
                    {currentIndex + 1} / {initialContent.length}
                  </span>
                )}
              </div>
            </SheetHeader>

            {/* Content area - fills remaining space */}
            <div className="flex-1 min-h-0">
              <ContentRenderer content={currentContent} />
            </div>

            {/* Compact Footer */}
            <SheetFooter className="border-t border-gray-100 bg-white/95 backdrop-blur-sm flex-shrink-0">
              <div className="w-full">
                {/* Metadata row */}
                <ContentMetadata
                  content={currentContent}
                  language={language}
                />
                {/* Actions row */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100" style={{ height: '48px' }}>
                  {/* Navigation */}
                  <div className="flex items-center gap-1.5">
                    {initialContent.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-brand-gold-100 hover:bg-brand-gold-50 hover:border-brand-gold-400"
                          onClick={handlePrevious}
                          aria-label="Previous"
                        >
                          <ChevronLeft className="w-4 h-4 text-brand-gold-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 border-brand-gold-100 hover:bg-brand-gold-50 hover:border-brand-gold-400"
                          onClick={handleNext}
                          aria-label="Next"
                        >
                          <ChevronRight className="w-4 h-4 text-brand-gold-600" />
                        </Button>
                      </>
                    )}
                  </div>
                  {/* Open PDF button */}
                  {currentContent?.file_type.includes('pdf') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(currentContent.url, '_blank')}
                      className="h-8 text-xs border-brand-gold-400 text-brand-gold-600 hover:bg-brand-gold-400 hover:text-white"
                    >
                      {language === 'ar' ? 'فتح PDF كامل' : 'Open Full PDF'}
                    </Button>
                  )}
                </div>
              </div>
            </SheetFooter>
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

