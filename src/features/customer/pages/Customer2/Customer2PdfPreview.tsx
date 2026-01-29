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
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    window.addEventListener('orientationchange', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('orientationchange', updateWidth);
    };
  }, []);

  useEffect(() => {
    setUseIframeFallback(false);
    setErrored(false);
  }, [url]);

  if (!url) {
    return (
      <div className="customer2-pdf" ref={containerRef}>
        <p className="customer2-pdf-message">
          {t('customer2.preview.empty') || 'No PDF preview available yet.'}
        </p>
      </div>
    );
  }

  if (errored) {
    return (
      <div className="customer2-pdf" ref={containerRef}>
        <p className="customer2-pdf-message">
          {t('customer2.preview.error') || 'Preview unavailable. Open the PDF instead.'}
        </p>
      </div>
    );
  }

  const iframeUrl = `${url}#view=FitH&toolbar=0&navpanes=0&scrollbar=0`;

  return (
    <div className="customer2-pdf" ref={containerRef}>
      {useIframeFallback ? (
        <iframe
          title="PDF preview"
          src={iframeUrl}
          className="customer2-pdf-iframe"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <Document
          file={{ url, withCredentials: false }}
          loading={
            <p className="customer2-pdf-message">
              {t('customer2.preview.loading') || 'Loading preview...'}
            </p>
          }
          error={
            <p className="customer2-pdf-message">
              {t('customer2.preview.error') || 'Preview unavailable. Open the PDF instead.'}
            </p>
          }
          onLoadError={() => setUseIframeFallback(true)}
        >
          <Page
            pageNumber={1}
            width={Math.max(240, width - 24)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      )}
    </div>
  );
};
