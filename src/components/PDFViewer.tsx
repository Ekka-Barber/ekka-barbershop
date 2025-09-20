import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useLanguage } from '@/contexts/LanguageContext';
// import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
// import * as pdfjsLib from 'pdfjs-dist'; // No longer needed if using pdfjs from react-pdf
import { motion, animate } from 'framer-motion';

// Configure PDF.js using the local worker file
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Disable CSS loading for layers to prevent 404 errors
pdfjs.GlobalWorkerOptions.disableTextLayer = true;
pdfjs.GlobalWorkerOptions.disableAnnotationLayer = true;

// Enable verbose logging for debugging
pdfjs.GlobalWorkerOptions.verbosity = 1;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { language } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [loadingTimeout, setLoadingTimeout] = useState<NodeJS.Timeout | null>(null);

  // Reference for tracking touch events
  const touchStartRef = useRef<number | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);

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
    console.log('PDFViewer: URL changed to:', pdfUrl);

    // Reset states when PDF URL changes
    setIsLoading(true);
    setLoadError(null);
    setPageNumber(1);
    setNumPages(null);

    // Validate URL
    if (!pdfUrl.startsWith('http')) {
      console.error('PDFViewer: Invalid PDF URL format:', pdfUrl);
      setLoadError('Invalid PDF URL');
      setIsLoading(false);
      return;
    }

    // Clear any existing timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
    }

    // Test URL accessibility
    fetch(pdfUrl, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache'
    })
    .then(response => {
      console.log('PDFViewer: URL accessibility check:', {
        url: pdfUrl,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
    })
    .catch(error => {
      console.error('PDFViewer: URL accessibility check failed:', error);
    });

    // Set a timeout for loading (30 seconds)
    const timeout = setTimeout(() => {
      console.error('PDFViewer: Loading timeout after 30 seconds');
      setLoadError('Loading timeout - PDF took too long to load');
      setIsLoading(false);
    }, 30000);

    setLoadingTimeout(timeout);

    // Cleanup function
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [pdfUrl]);

  // Navigation functions
  const nextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(prev => prev - 1);
    }
  };

  // Touch event handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    touchStartRef.current = e.touches[0].clientX;
    setDragDistance(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartRef.current === null || !isDragging) return;
    
    const touchX = e.touches[0].clientX;
    const diff = touchStartRef.current - touchX;
    
    // Only allow dragging in valid directions 
    // (can't go left at first page, can't go right at last page)
    if ((pageNumber <= 1 && diff < 0) || (pageNumber >= (numPages || 1) && diff > 0)) {
      // Add some resistance to overscrolling
      setDragDistance(-diff * 0.3);
    } else {
      setDragDistance(-diff);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    
    // Smooth animation back to center if not swiping far enough
    setIsDragging(false);
    animate(dragDistance, 0, {
      duration: 0.3,
      onUpdate: latest => setDragDistance(latest)
    });
    
    // Determine swipe direction (larger threshold for page change: 80px)
    if (Math.abs(diff) > 80) {
      if (diff > 0 && pageNumber < (numPages || 1)) {
        // Swiped left (go to next page)
        nextPage();
      } else if (diff < 0 && pageNumber > 1) {
        // Swiped right (go to previous page)
        prevPage();
      }
    }
    
    touchStartRef.current = null;
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully', { pdfUrl, numPages });

    // Clear loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    setNumPages(numPages);
    setIsLoading(false);
    setLoadError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF load error:', error, 'URL:', pdfUrl);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    // Clear loading timeout
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      setLoadingTimeout(null);
    }

    setLoadError(`${error.name}: ${error.message}`);
    setIsLoading(false);
  }

  if (loadError) {
    return (
      <div className="text-center py-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-600 font-medium mb-2">PDF Loading Failed</p>
          <p className="text-sm text-gray-600 mb-2">Error: {loadError}</p>
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
          <br />
          <button
            onClick={() => {
              console.log('Retrying PDF load...');
              setLoadError(null);
              setIsLoading(true);
              setPageNumber(1);
              setNumPages(null);
            }}
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors mt-2"
          >
            {language === 'ar' ? '🔄 إعادة المحاولة' : '🔄 Retry Loading'}
          </button>
        </div>
      </div>
    );
  }

  // Should we show the previous page preview?
  const showPrevPagePreview = pageNumber > 1 && !isLoading && numPages !== null;
  
  // Should we show the next page preview?
  const showNextPagePreview = numPages !== null && pageNumber < numPages && !isLoading;

  return (
    <div className="pdf-viewer w-full mx-auto" ref={viewerRef}>
      <Document
        file={{
          url: pdfUrl,
          httpHeaders: {
            'Cache-Control': 'no-cache'
          },
          withCredentials: false
        }}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        className="flex flex-col items-center"
        loading={
          <div className="text-center py-4 h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="animate-pulse">
              <div>Loading PDF...</div>
              <div className="text-sm text-gray-500 mt-2">This may take a few moments</div>
            </div>
          </div>
        }
        options={{
          cMapUrl: null,
          cMapPacked: false,
          disableAutoFetch: false,
          disableCreateObjectURL: false,
          disableFontFace: false,
          disableRange: false,
          disableStream: false,
          docBaseUrl: null,
          isEvalSupported: true,
          maxImageSize: -1,
          pdfBug: false,
          verbosity: 1
        }}
      >
        <div 
          ref={dragConstraintsRef}
          className="overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'pan-y' }}
        >
          {!isLoading && numPages !== null && (
            <div className="relative">
              {/* Current page with drag effect */}
              <motion.div
                style={{ 
                  x: dragDistance,
                  position: 'relative',
                  zIndex: 10
                }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 1000, 
                  damping: 100,
                  restDelta: 0.001
                }}
              >
                <Page 
                  key={`page_${pageNumber}`}
                  pageNumber={pageNumber} 
                  width={pageWidth}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="max-w-full shadow-lg rounded-lg"
                  loading={
                    <div className="h-[500px] flex items-center justify-center">
                      <div className="animate-pulse">Loading page...</div>
                    </div>
                  }
                />
              </motion.div>
              
              {/* Next page preview (right side edge) */}
              {showNextPagePreview && (
                <motion.div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    right: -pageWidth,
                    x: dragDistance < 0 ? 0 : Math.min(pageWidth + dragDistance, 0),
                    zIndex: 8,
                    opacity: dragDistance < 0 ? Math.min(Math.abs(dragDistance) / 150, 1) : 0,
                    boxShadow: '-5px 0 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <Page 
                    key={`next_page_${pageNumber + 1}`}
                    pageNumber={pageNumber + 1}
                    width={pageWidth} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full rounded-lg"
                    loading={null}
                  />
                </motion.div>
              )}
              
              {/* Previous page preview (left side edge) */}
              {showPrevPagePreview && (
                <motion.div 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: -pageWidth,
                    x: dragDistance > 0 ? 0 : Math.max(-pageWidth + dragDistance, -pageWidth),
                    zIndex: 8,
                    opacity: dragDistance > 0 ? Math.min(Math.abs(dragDistance) / 150, 1) : 0,
                    boxShadow: '5px 0 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <Page 
                    key={`prev_page_${pageNumber - 1}`}
                    pageNumber={pageNumber - 1}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full rounded-lg"
                    loading={null}
                  />
                </motion.div>
              )}
            </div>
          )}
        </div>
      </Document>
      
      {/* Only show page indicator */}
      {numPages && numPages > 1 && (
        <div className="flex justify-center mt-4">
          <p className="text-center px-4 py-2 bg-[#C4A36F]/10 rounded-full text-[#222222] font-medium">
            {`${pageNumber} / ${numPages}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
