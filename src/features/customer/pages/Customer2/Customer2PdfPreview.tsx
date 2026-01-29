import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { useLanguage } from '@/contexts/LanguageContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface Customer2PdfPreviewProps {
  url?: string | null;
}

export const Customer2PdfPreview = ({ url }: Customer2PdfPreviewProps) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  if (!url) {
    return (
      <div className="customer2-pdf" ref={containerRef}>
        <p className="customer2-pdf-message">
          {t('customer2.preview.empty') || 'No PDF preview available yet.'}
        </p>
      </div>
    );
  }

  return (
    <div className="customer2-pdf" ref={containerRef}>
      <Document
        file={url}
        loading={
          <p className="customer2-pdf-message">
            {t('customer2.preview.loading') || 'Loading preview...' }
          </p>
        }
        error={
          <p className="customer2-pdf-message">
            {t('customer2.preview.error') || 'Preview unavailable. Open the PDF instead.'}
          </p>
        }
      >
        <Page
          pageNumber={1}
          width={Math.max(240, width - 24)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
};
