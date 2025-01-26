import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdfUrl: string;
}

const PDFViewer = ({ pdfUrl }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-viewer w-full max-w-3xl mx-auto">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex flex-col items-center"
      >
        <Page 
          pageNumber={pageNumber} 
          width={Math.min(window.innerWidth - 32, 800)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPageNumber(page => Math.max(1, page - 1))}
          disabled={pageNumber <= 1}
          className="px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
        >
          Previous
        </button>
        <p className="text-center">
          Page {pageNumber} of {numPages}
        </p>
        <button
          onClick={() => setPageNumber(page => Math.min(numPages || page, page + 1))}
          disabled={pageNumber >= (numPages || 1)}
          className="px-4 py-2 bg-blue-900 text-white rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PDFViewer;