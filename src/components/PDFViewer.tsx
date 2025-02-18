
import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
  menuFileId?: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);
  const [scale, setScale] = useState(1);
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  useEffect(() => {
    const updatePageWidth = () => {
      const width = window.innerWidth;
      setPageWidth(Math.min(width - 32, 800));
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);

    return () => {
      window.removeEventListener('resize', updatePageWidth);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
  };

  const handleZoom = (zoomIn: boolean) => {
    setScale(prevScale => {
      const newScale = zoomIn ? prevScale + 0.2 : prevScale - 0.2;
      if (newScale >= 0.5 && newScale <= 2) {
        return newScale;
      }
      return prevScale;
    });
  };

  // Only show navigation if there's more than one page
  const showNavigation = numPages !== null && numPages > 1;

  return (
    <div className="pdf-viewer w-full mx-auto">
      <div className="flex justify-center gap-4 mb-4">
        <button
          onClick={() => handleZoom(false)}
          disabled={scale <= 0.5}
          className="p-2 rounded-full bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          -
        </button>
        <span className="p-2">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => handleZoom(true)}
          disabled={scale >= 2}
          className="p-2 rounded-full bg-[#C4A36F] hover:bg-[#B39260] text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
      
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        <Page 
          pageNumber={pageNumber} 
          width={pageWidth}
          scale={scale}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full shadow-lg rounded-lg"
        />
      </Document>
      
      {showNavigation && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <button
            onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}
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
            onClick={() => handlePageChange(Math.min(numPages || pageNumber, pageNumber + 1))}
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
