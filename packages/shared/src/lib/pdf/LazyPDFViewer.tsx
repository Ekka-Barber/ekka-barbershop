import React, { useEffect, useMemo, useState } from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';

import { useLanguage } from '@/contexts/LanguageContext';

interface LazyPDFViewerProps {
  pdfUrl: string;
  className?: string;
  height?: string;
  variant?: 'default' | 'dialog';
}

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
  pdfUrl,
  className,
  height = '70vh',
  variant = 'default',
}) => {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const isAndroid = useMemo(() => (
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
  ), []);
  const isIOS = useMemo(() => (
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  ), []);

  // Fallback: if onLoad never fires (some PDF viewers don't emit), clear the overlay after a short delay
  useEffect(() => {
    if (loaded || errored || isAndroid) return;
    const id = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(id);
  }, [loaded, errored, isAndroid]);

  const iframeUrl = useMemo(() => {
    // Hide unnecessary chrome in most PDF viewers
    const toolbar = isAndroid ? 1 : 0;
    const navpanes = isAndroid ? 1 : 0;
    const view = isIOS ? 'FitH' : 'FitH';
    return `${pdfUrl}#toolbar=${toolbar}&navpanes=${navpanes}&scrollbar=0&view=${view}`;
  }, [pdfUrl, isAndroid, isIOS]);

  const handleOpen = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  // Error state
  if (errored) {
    if (variant === 'dialog') {
      return (
        <div className={cn('w-full h-full flex flex-col items-center justify-center gap-4 bg-red-50/50 p-6', className)}>
          <p className="text-lg font-semibold text-red-800">
            {t('pdf.viewer.error.title') || 'PDF failed to load'}
          </p>
          <p className="text-sm text-red-600 text-center">
            {t('pdf.viewer.error.message') || 'Open the PDF in a new tab instead.'}
          </p>
          <Button variant="destructive" onClick={handleOpen}>
            {t('pdf.viewer.open') || 'Open PDF'}
          </Button>
        </div>
      );
    }
    
    return (
      <Card className={cn('w-full border-red-200 bg-red-50/50', className)}>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <p className="text-lg font-semibold text-red-800">
            {t('pdf.viewer.error.title') || 'PDF failed to load'}
          </p>
          <p className="text-sm text-red-600">
            {t('pdf.viewer.error.message') || 'Open the PDF in a new tab instead.'}
          </p>
          <Button variant="destructive" onClick={handleOpen}>
            {t('pdf.viewer.open') || 'Open PDF'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Dialog variant - simple, no extra scroll, iframe fills space naturally
  if (variant === 'dialog') {
    return (
      <div className={cn('relative w-full h-full bg-brand-gold-50', className)}>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-gold-50 z-10">
            <div className="h-10 w-10 border-4 border-[#e9b353]/30 border-t-[#e9b353] rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              {t('pdf.viewer.loading') || 'Loading PDF...'}
            </p>
            <Button variant="secondary" size="sm" onClick={handleOpen}>
              {t('pdf.viewer.open') || 'Open in new tab'}
            </Button>
          </div>
        )}
        {isAndroid && !errored && (
          <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none z-20">
            <Button variant="secondary" size="sm" onClick={handleOpen} className="pointer-events-auto">
              {t('pdf.viewer.open') || 'Open PDF'}
            </Button>
          </div>
        )}
        <iframe
          title="PDF preview"
          src={iframeUrl}
          className="w-full h-full border-0"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
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
          {!loaded && !isAndroid && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <div className="h-10 w-10 border-4 border-[#e9b353]/30 border-t-[#e9b353] rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t('pdf.viewer.loading') || 'Loading PDF...'}
              </p>
              <Button variant="secondary" size="sm" onClick={handleOpen} className="pointer-events-auto">
                {t('pdf.viewer.open') || 'Open in new tab'}
              </Button>
            </div>
          )}

          {(isAndroid || errored) && (
            <div className="absolute bottom-3 left-3 right-3 flex justify-center pointer-events-none z-10">
              <Button variant="secondary" size="sm" onClick={handleOpen} className="pointer-events-auto">
                {t('pdf.viewer.open') || 'Open PDF'}
              </Button>
            </div>
          )}

          <iframe
            title="PDF preview"
            src={iframeUrl}
            className="w-full h-full border-0 pdf-iframe"
            style={{ minHeight: height, height }}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
