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
  fileName?: string;
}

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
  pdfUrl,
  className,
  height = '70vh',
  variant = 'default',
  fileName,
}) => {
  const { t } = useLanguage();
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isAndroid = useMemo(() => (
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)
  ), []);
  const isIOS = useMemo(() => (
    typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)
  ), []);
  const resolvedFileName = useMemo(() => {
    if (fileName?.trim()) {
      const trimmedName = fileName.trim();
      return trimmedName.toLowerCase().endsWith('.pdf')
        ? trimmedName
        : `${trimmedName}.pdf`;
    }

    try {
      const url = new URL(pdfUrl);
      const lastSegment = url.pathname.split('/').pop();
      const decoded = lastSegment ? decodeURIComponent(lastSegment) : 'document.pdf';
      if (!decoded) return 'document.pdf';
      return decoded.toLowerCase().endsWith('.pdf') ? decoded : `${decoded}.pdf`;
    } catch {
      return 'document.pdf';
    }
  }, [fileName, pdfUrl]);

  // Fallback: if onLoad never fires (some PDF viewers don't emit), clear the overlay after a short delay
  useEffect(() => {
    if (loaded || errored) return;
    const id = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(id);
  }, [loaded, errored]);

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

  const handleOpen = () => {
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(pdfUrl, { credentials: 'omit' });
      if (!response.ok) {
        throw new Error('Failed to fetch PDF');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resolvedFileName;
      link.rel = 'noopener';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloading(false);
    }
  };

  const openLabel = t('pdf.viewer.openExternal') || 'Open in new tab';
  const downloadLabel = t('pdf.viewer.download') || 'Download PDF';
  const errorTitle = t('pdf.viewer.failed') || 'Unable to load this PDF';
  const errorMessage =
    t('pdf.viewer.fallbackMessage') || 'Open the PDF in a new tab or download it instead.';
  const ActionButtons = ({
    primaryVariant = 'secondary',
    className: actionClassName,
  }: {
    primaryVariant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
    className?: string;
  }) => (
    <div className={cn('flex flex-col items-center gap-2 sm:flex-row', actionClassName)}>
      <Button variant={primaryVariant} size="sm" onClick={handleOpen}>
        {openLabel}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={downloading}
        aria-busy={downloading}
      >
        {downloadLabel}
      </Button>
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
          <ActionButtons primaryVariant="destructive" />
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
          <ActionButtons primaryVariant="destructive" />
        </CardContent>
      </Card>
    );
  }

  // Dialog variant - simple, no extra scroll, iframe fills space naturally
  if (variant === 'dialog') {
    return (
      <div className={cn('relative w-full h-full bg-brand-gold-50', className)}>
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-gold-50 z-10 pointer-events-none">
            <div className="h-10 w-10 border-4 border-[#e9b353]/30 border-t-[#e9b353] rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              {t('loading.pdf.viewer') || 'Loading PDF viewer...'}
            </p>
            <ActionButtons className="pointer-events-auto" />
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
        {isAndroid && loaded && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
            <ActionButtons className="pointer-events-auto" />
          </div>
        )}
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
          {!loaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
              <div className="h-10 w-10 border-4 border-[#e9b353]/30 border-t-[#e9b353] rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">
                {t('loading.pdf.viewer') || 'Loading PDF viewer...'}
              </p>
              <ActionButtons className="pointer-events-auto" />
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
          {isAndroid && loaded && (
            <div className="absolute inset-x-0 bottom-3 flex justify-center pointer-events-none">
              <ActionButtons className="pointer-events-auto" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
