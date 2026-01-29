import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import { cn } from '@shared/lib/utils';
import { Card, CardContent } from '@shared/ui/components/card';

import { useLanguage } from '@/contexts/LanguageContext';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface LazyPDFViewerProps {
  pdfUrl: string;
  className?: string;
  height?: string;
  variant?: 'default' | 'dialog';
  fileName?: string;
}

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = (props) => {
  const {
    pdfUrl,
    className,
    height = '70vh',
    variant = 'default',
  } = props;
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const isAndroid = useMemo(() => (
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
  ), []);
  const isIOS = useMemo(() => (
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  ), []);

  useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setUseIframeFallback(false);
  }, [pdfUrl]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setPageWidth(containerRef.current.clientWidth);
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

  // Fallback: if onLoad never fires (some PDF viewers don't emit), clear the overlay after a short delay
  useEffect(() => {
    if (loaded || errored) return;
    if (!useIframeFallback) return;
    const id = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(id);
  }, [loaded, errored, useIframeFallback]);

  const iframeUrl = useMemo(() => {
    // Hide unnecessary chrome in most PDF viewers
    const params = new URLSearchParams();
    params.set('toolbar', isAndroid ? '1' : '0');
    params.set('navpanes', isAndroid ? '1' : '0');
    params.set('scrollbar', isAndroid ? '1' : '0');
    params.set('view', 'FitH');
    if (isIOS) {
      params.set('zoom', 'page-fit');
    }
    return `${pdfUrl}#${params.toString()}`;
  }, [pdfUrl, isAndroid, isIOS]);

  const errorTitle = t('pdf.viewer.failed') || 'Unable to load this PDF';
  const errorMessage =
    t('pdf.viewer.fallbackMessage') || 'Open the PDF in a new tab to view it.';

  const renderLoadingOverlay = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-gold-50/90 backdrop-blur-md z-10 pointer-events-none">
      <div className="h-10 w-10 border-4 border-[#e9b353]/30 border-t-[#e9b353] rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">
        {t('loading.pdf.viewer') || 'Loading PDF viewer...'}
      </p>
    </div>
  );

  const embedIframe = () => (
    <iframe
      title="PDF preview"
      src={iframeUrl}
      className="w-full h-full border-0 pdf-iframe"
      style={{ minHeight: height, height }}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setErrored(true)}
    />
  );

  const renderPdfPreview = () => (
    <div ref={containerRef} className="w-full">
      <Document
        file={{ url: pdfUrl, withCredentials: false }}
        onLoadSuccess={() => setLoaded(true)}
        onLoadError={() => {
          if (!useIframeFallback) {
            setUseIframeFallback(true);
            setLoaded(false);
            setErrored(false);
            return;
          }
          setErrored(true);
        }}
        loading={
          <p className="sr-only">
            {t('loading.pdf.viewer') || 'Loading PDF viewer...'}
          </p>
        }
        error={
          <p className="sr-only">
            {t('pdf.viewer.failed') || 'Unable to load this PDF'}
          </p>
        }
      >
        <Page
          pageNumber={1}
          width={Math.max(240, pageWidth || 0)}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );

  // Error state
  if (errored) {
    if (variant === 'dialog') {
      return (
        <div className={cn('w-full h-full flex flex-col items-center justify-center gap-4 bg-red-50/50 p-6', className)}>
          <p className="text-lg font-semibold text-red-800">
            {errorTitle}
          </p>
          <p className="text-sm text-red-600 text-center">
            {errorMessage}
          </p>
        </div>
      );
    }
    
    return (
      <Card className={cn('w-full border-red-200 bg-red-50/50', className)}>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <p className="text-lg font-semibold text-red-800">
            {errorTitle}
          </p>
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Dialog variant - simple, no extra scroll, iframe fills space naturally
  if (variant === 'dialog') {
    return (
      <div className={cn('relative w-full h-full bg-brand-gold-50', className)}>
        {useIframeFallback ? embedIframe() : renderPdfPreview()}
        {!loaded && !errored && renderLoadingOverlay()}
      </div>
    );
  }

  // Default variant with Card wrapper
  return (
    <Card
      className={cn(
        'w-full overflow-hidden bg-white border border-[#E4D8C8]/70 shadow-sm',
        className
      )}
    >
      <CardContent className="p-0">
        <div
          className="relative w-full bg-brand-gold-50 overflow-hidden"
          style={{ minHeight: height }}
        >
          {useIframeFallback ? embedIframe() : renderPdfPreview()}
          {!loaded && !errored && renderLoadingOverlay()}
        </div>
      </CardContent>
    </Card>
  );
};
