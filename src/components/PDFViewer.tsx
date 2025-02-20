
import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Configure PDF.js worker
// Using explicit https protocol and backup CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  useEffect(() => {
    const updatePageWidth = () => {
      const width = window.innerWidth;
      setPageWidth(Math.min(width - 32, 800)); // 32px for padding
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  useEffect(() => {
    // Reset states when PDF URL changes
    setIsLoading(true);
    setLoadError(null);
    setPageNumber(1);
    setNumPages(null);
  }, [pdfUrl]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error);
    setLoadError(error.message);
    setIsLoading(false);
  }

  // Only show navigation if there's more than one page
  const showNavigation = numPages !== null && numPages > 1;

  if (loadError) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load PDF. Please try again later.
      </div>
    );
  }

  return (
    <div className="pdf-viewer w-full mx-auto">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="flex flex-col items-center"
        loading={
          <div className="text-center py-4">
            <div className="animate-pulse">Loading PDF...</div>
          </div>
        }
      >
        <Page 
          pageNumber={pageNumber} 
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full shadow-lg rounded-lg"
          loading={
            <div className="text-center py-4">
              <div className="animate-pulse">Loading page...</div>
            </div>
          }
        />
      </Document>
      {showNavigation && (
        <div className="flex items-center justify-between px-4 mt-6 max-w-[400px] mx-auto">
          <button
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="p-3 rounded-full bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
            aria-label="Previous page"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <p className="text-center text-[#222222] font-medium min-w-[100px]">
            {language === 'ar' 
              ? `${pageNumber} / ${numPages}`
              : `${pageNumber} / ${numPages}`
            }
          </p>
          
          <button
            onClick={() => setPageNumber(page => Math.min(numPages || page, page + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="p-3 rounded-full bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
            aria-label="Next page"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
