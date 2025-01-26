import { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useIsMobile } from '@/hooks/use-mobile';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageWidth, setPageWidth] = useState(800);
  const isMobile = useIsMobile();

  useEffect(() => {
    const updatePageWidth = () => {
      const width = window.innerWidth;
      setPageWidth(Math.min(width - 32, 800)); // 32px for padding
    };

    updatePageWidth();
    window.addEventListener('resize', updatePageWidth);
    return () => window.removeEventListener('resize', updatePageWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Only show navigation if there's more than one page
  const showNavigation = numPages !== null && numPages > 1;

  return (
    <div className="pdf-viewer w-full mx-auto">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        <Page 
          pageNumber={pageNumber} 
          width={pageWidth}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="max-w-full shadow-lg"
        />
      </Document>
      {showNavigation && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-4">
          <button
            onClick={() => setPageNumber(page => Math.max(1, page - 1))}
            disabled={pageNumber <= 1}
            className="w-full sm:w-auto px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
          >
            Previous
          </button>
          <p className="text-center">
            Page {pageNumber} of {numPages}
          </p>
          <button
            onClick={() => setPageNumber(page => Math.min(numPages || page, page + 1))}
            disabled={pageNumber >= (numPages || 1)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;