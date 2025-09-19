import React, { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Set up PDF.js worker - using local file to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { language } = useLanguage();

  // Detect mobile device for UI adjustments
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
    console.log('PDF loaded successfully:', { numPages, url: pdfUrl });
  }, [pdfUrl]);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('Failed to load PDF:', error);
    setError('Failed to load PDF document');
  }, []);

  const changePage = useCallback((offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages || 1);
    });
  }, [numPages]);

  const previousPage = useCallback(() => changePage(-1), [changePage]);
  const nextPage = useCallback(() => changePage(1), [changePage]);

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium mb-2">PDF Loading Failed</p>
          <p className="text-sm text-gray-600 mb-2">{error}</p>
          <p className="text-xs text-gray-500">URL: {pdfUrl.substring(0, 50)}...</p>
        </div>
        <div className="space-y-2">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {language === 'ar' ? '📄 فتح PDF في نافذة جديدة' : '📄 Open PDF in new window'}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container w-full">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={
          <div className="flex items-center justify-center h-[400px] bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C4A36F] mx-auto mb-4"></div>
              <p className="text-gray-600">
                {language === 'ar' ? 'جاري تحميل PDF...' : 'Loading PDF...'}
              </p>
            </div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-[400px] bg-red-50 rounded-lg border border-red-200">
            <div className="text-center">
              <p className="text-red-600 mb-2">
                {language === 'ar' ? 'فشل في تحميل PDF' : 'Failed to load PDF'}
              </p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline"
              >
                {language === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new window'}
              </a>
            </div>
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          width={isMobile ? window.innerWidth - 32 : Math.min(window.innerWidth - 64, 800)}
          className="shadow-lg rounded-lg overflow-hidden mx-auto"
        />
      </Document>

      {/* Page Navigation */}
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <button
            onClick={previousPage}
            disabled={pageNumber <= 1}
            className={`${
              isMobile ? 'p-3' : 'p-2'
            } bg-[#C4A36F] text-white rounded-full hover:bg-[#B39A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            aria-label="Previous page"
          >
            <ChevronLeft className={isMobile ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max={numPages}
              value={pageNumber}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= (numPages || 1)) {
                  setPageNumber(page);
                }
              }}
              className={`${
                isMobile ? 'w-16' : 'w-12'
              } text-center border border-gray-300 rounded px-2 py-1 text-sm`}
            />
            <span className="text-gray-600 text-sm">
              {language === 'ar' ? 'من' : 'of'} {numPages}
            </span>
          </div>

          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className={`${
              isMobile ? 'p-3' : 'p-2'
            } bg-[#C4A36F] text-white rounded-full hover:bg-[#B39A5F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            aria-label="Next page"
          >
            <ChevronRight className={isMobile ? 'w-6 h-6' : 'w-5 h-5'} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
