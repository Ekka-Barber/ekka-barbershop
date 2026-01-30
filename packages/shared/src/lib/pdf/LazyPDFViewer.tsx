import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  getDocument,
  GlobalWorkerOptions,
  type PDFDocumentProxy,
} from 'pdfjs-dist/legacy/build/pdf';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@shared/lib/utils';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';

import { useLanguage } from '@/contexts/LanguageContext';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface LazyPDFViewerProps {
  pdfUrl: string;
  className?: string;
  height?: string;
  variant?: 'default' | 'dialog' | 'fullscreen';
  fileName?: string;
  showPageIndicator?: boolean;
  enableSwipeNavigation?: boolean;
  autoHideControls?: boolean;
}

const SPINNER_CLASS =
  'h-10 w-10 border-4 border-[#E9B353]/35 border-t-[#E9B353] rounded-full animate-spin';
const MIN_SWIPE_DISTANCE = 50;
const TAP_THRESHOLD = 10;
const CONTROLS_HIDE_DELAY = 3000;

export const LazyPDFViewer: React.FC<LazyPDFViewerProps> = ({
  pdfUrl,
  className,
  height = '70vh',
  variant = 'default',
  fileName,
  showPageIndicator = true,
  enableSwipeNavigation = true,
  autoHideControls = true,
}) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressClickRef = useRef(false);
  const touchStartRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });
  const touchEndRef = useRef<{ x: number | null; y: number | null }>({
    x: null,
    y: null,
  });

  const [isMobile, setIsMobile] = useState(false);
  const [pdfBuffer, setPdfBuffer] = useState<ArrayBuffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const translate = useCallback(
    (key: string, fallback: string) => {
      const value = t(key);
      return value === key ? fallback : value;
    },
    [t]
  );

  const isDialogVariant = variant === 'dialog';
  const isFullscreenVariant = variant === 'fullscreen';
  const shouldAutoHideControls = autoHideControls && isMobile;

  const containerStyle = useMemo(() => {
    if (isDialogVariant) {
      return { height: '100%', minHeight: '300px' };
    }

    if (isFullscreenVariant) {
      return { height: '100dvh', minHeight: '300px' };
    }

    if (isMobile) {
      return {
        height: 'calc(100dvh - 120px)',
        minHeight: '300px',
      };
    }

    return { height, minHeight: height };
  }, [height, isMobile, isDialogVariant, isFullscreenVariant]);

  const clearControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    if (!shouldAutoHideControls) {
      return;
    }

    clearControlsTimeout();
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, CONTROLS_HIDE_DELAY);
  }, [clearControlsTimeout, shouldAutoHideControls]);

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  const handleToggleControls = useCallback(() => {
    if (!shouldAutoHideControls) {
      setShowControls(true);
      return;
    }

    if (showControls) {
      clearControlsTimeout();
      setShowControls(false);
      return;
    }

    showControlsTemporarily();
  }, [clearControlsTimeout, shouldAutoHideControls, showControls, showControlsTemporarily]);

  useEffect(() => {
    if (!shouldAutoHideControls) {
      clearControlsTimeout();
      setShowControls(true);
      return undefined;
    }

    showControlsTemporarily();

    return () => {
      clearControlsTimeout();
    };
  }, [clearControlsTimeout, shouldAutoHideControls, showControlsTemporarily]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const handleChange = () => setIsMobile(mediaQuery.matches);

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }

    mediaQuery.addListener(handleChange);
    return () => {
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    setErrored(false);
    setPdfBuffer(null);

    const controller = new AbortController();

    const fetchPdf = async () => {
      try {
        const response = await fetch(pdfUrl, {
          credentials: 'omit',
          cache: 'no-cache',
          mode: 'cors',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to load PDF');
        }

        const buffer = await response.arrayBuffer();
        if (!controller.signal.aborted) {
          setPdfBuffer(buffer);
        }
      } catch {
        if (controller.signal.aborted) {
          return;
        }
        setErrored(true);
        setLoading(false);
      }
    };

    fetchPdf();

    return () => controller.abort();
  }, [pdfUrl, retryKey]);

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateSize();

    if (typeof ResizeObserver === 'undefined' || !containerRef.current) {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!pdfBuffer) {
      return undefined;
    }

    let active = true;
    let loadedPdf: PDFDocumentProxy | null = null;

    const loadDoc = async () => {
      try {
        setLoading(true);
        setErrored(false);
        const loadingTask = getDocument({
          data: pdfBuffer,
          cMapPacked: true,
          disableAutoFetch: true,
        });

        loadedPdf = await loadingTask.promise;
        if (!active) {
          loadedPdf.destroy();
          return;
        }

        pdfDocRef.current = loadedPdf;
        setPageCount(loadedPdf.numPages);
        setCurrentPage(1);
      } catch {
        setErrored(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDoc();

    return () => {
      active = false;
      if (loadedPdf) {
        loadedPdf.destroy();
      }
      if (pdfDocRef.current === loadedPdf) {
        pdfDocRef.current = null;
      }
    };
  }, [pdfBuffer]);

  useEffect(() => {
    if (!pdfDocRef.current || pageCount === 0) {
      return undefined;
    }

    let active = true;

    const renderPage = async () => {
      setLoading(true);
      setErrored(false);

      try {
        const page = await pdfDocRef.current!.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1 });
        const targetWidth =
          containerSize.width > 0 ? containerSize.width : viewport.width;
        const targetHeight =
          containerSize.height > 0 ? containerSize.height : viewport.height;

        // Calculate scale to fit PDF within container (contain mode)
        const widthScale = targetWidth / viewport.width;
        const heightScale = targetHeight / viewport.height;
        const cssScale = Math.min(widthScale, heightScale);

        const scaledViewport = page.getViewport({ scale: cssScale });
        const dpr =
          typeof window !== 'undefined'
            ? Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
            : 1;

        const canvas = canvasRef.current;
        if (!canvas) {
          throw new Error('Canvas is not mounted');
        }

        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Unable to access canvas context');
        }

        // Set internal canvas resolution (high DPI)
        const pixelWidth = Math.floor(scaledViewport.width * dpr);
        const pixelHeight = Math.floor(scaledViewport.height * dpr);
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;

        // Set CSS display size to fit within container
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;
        canvas.style.maxWidth = '100%';
        canvas.style.maxHeight = '100%';

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
          transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined,
        }).promise;
      } catch {
        if (!active) {
          return;
        }
        setErrored(true);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    renderPage();

    return () => {
      active = false;
    };
  }, [pageCount, containerSize.width, containerSize.height, currentPage, isMobile]);

  const canNavigatePrev = currentPage > 1;
  const canNavigateNext = pageCount > currentPage;

  const handlePrev = useCallback(() => {
    if (!canNavigatePrev) {
      return;
    }

    setCurrentPage((prev) => Math.max(1, prev - 1));
    showControlsTemporarily();
  }, [canNavigatePrev, showControlsTemporarily]);

  const handleNext = useCallback(() => {
    if (!canNavigateNext) {
      return;
    }

    setCurrentPage((prev) => Math.min(pageCount, prev + 1));
    showControlsTemporarily();
  }, [canNavigateNext, pageCount, showControlsTemporarily]);

  const handleRetry = useCallback(() => {
    setErrored(false);
    setLoading(true);
    setRetryKey((prev) => prev + 1);
  }, []);

  const handleContainerClick = useCallback(() => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    handleToggleControls();
  }, [handleToggleControls]);

  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    suppressClickRef.current = false;
    const touch = event.targetTouches[0];

    if (!touch) {
      return;
    }

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    touchEndRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (!enableSwipeNavigation) {
        return;
      }

      const touch = event.targetTouches[0];

      if (!touch) {
        return;
      }

      touchEndRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [enableSwipeNavigation]
  );

  const handleTouchEnd = useCallback(() => {
    const start = touchStartRef.current;
    const end = touchEndRef.current;

    if (start.x === null || start.y === null || end.x === null || end.y === null) {
      handleToggleControls();
      return;
    }

    const distanceX = start.x - end.x;
    const distanceY = start.y - end.y;
    const movementX = Math.abs(distanceX);
    const movementY = Math.abs(distanceY);
    const isHorizontalSwipe = movementX > movementY;
    const isTap = movementX < TAP_THRESHOLD && movementY < TAP_THRESHOLD;

    if (
      enableSwipeNavigation &&
      isHorizontalSwipe &&
      Math.abs(distanceX) > MIN_SWIPE_DISTANCE
    ) {
      suppressClickRef.current = true;

      if (distanceX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      return;
    }

    if (isTap) {
      suppressClickRef.current = true;
      handleToggleControls();
    }
  }, [enableSwipeNavigation, handleNext, handlePrev, handleToggleControls]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    },
    [handleNext, handlePrev]
  );

  const errorTitle = translate('pdf.viewer.failed', 'Unable to load this PDF');
  const errorMessage = translate(
    'pdf.viewer.fallbackMessage',
    'Open the PDF in a new tab to view it.'
  );
  const loadingMessage = translate(
    'loading.pdf.viewer',
    'Loading PDF viewer...'
  );
  const previewLabel = fileName
    ? `${fileName} preview`
    : translate('pdf.viewer.previewTitle', 'Preview');
  const containerLabel = translate('pdf.viewer.fullscreenTitle', 'PDF viewer');
  const prevLabel = translate('pdf.viewer.prev', 'Previous page');
  const nextLabel = translate('pdf.viewer.next', 'Next page');
  const pageLabel = translate('pdf.viewer.page', 'Page');
  const ofLabel = translate('pdf.viewer.of', 'of');
  const pageIndicatorLabel = `${pageLabel} ${currentPage} ${ofLabel} ${pageCount}`;

  const renderLoadingOverlay = () => (
    <div className="pdf-loading-overlay absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-gold-50/95 backdrop-blur-md z-10 pointer-events-none">
      <div className="pdf-loading-skeleton" aria-hidden="true" />
      <div className={SPINNER_CLASS} />
      <p className="text-sm text-muted-foreground">{loadingMessage}</p>
    </div>
  );

  const renderErrorContent = () => (
    <>
      <p className="text-lg font-semibold text-red-800">{errorTitle}</p>
      <p className="text-sm text-red-600 text-center">{errorMessage}</p>
      <Button
        type="button"
        variant="outline"
        onClick={handleRetry}
        className="border-red-200 text-red-700 hover:bg-red-50"
      >
        {translate('pdf.viewer.retry', 'Try again')}
      </Button>
    </>
  );

  const renderCanvasArea = () => (
    <div
      ref={containerRef}
      className={cn(
        'pdf-viewer-container relative w-full h-full overflow-hidden bg-white flex items-center justify-center',
        isMobile ? 'pdf-viewer-mobile' : 'pdf-viewer-desktop'
      )}
      style={containerStyle}
      onClick={handleContainerClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-label={containerLabel}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        aria-label={previewLabel}
        role="img"
        className={cn(
          'pdf-canvas block max-w-full max-h-full rounded-lg bg-white shadow-sm',
          loading ? 'opacity-60' : 'opacity-100'
        )}
      />
      {(canNavigatePrev || canNavigateNext) && (
        <div
          className={cn(
            'pdf-nav-controls absolute inset-0 flex items-center justify-between px-4 transition-opacity duration-200',
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          aria-hidden={!showControls}
        >
          {canNavigatePrev && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handlePrev();
              }}
              className="pdf-nav-button"
              aria-label={prevLabel}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          {canNavigateNext && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleNext();
              }}
              className="pdf-nav-button"
              aria-label={nextLabel}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
      {loading && !errored && renderLoadingOverlay()}

      {showPageIndicator && pageCount > 0 && (
        <div className="pdf-page-pill absolute bottom-4 left-1/2 -translate-x-1/2">
          <span aria-live="polite" aria-atomic="true" aria-label={pageIndicatorLabel}>
            {currentPage} / {pageCount}
          </span>
        </div>
      )}
    </div>
  );

  if (errored) {
    if (isDialogVariant || isFullscreenVariant) {
      return (
        <div
          className={cn(
            'w-full h-full flex flex-col items-center justify-center gap-4 bg-red-50/50 border border-red-200 p-6',
            className
          )}
        >
          {renderErrorContent()}
        </div>
      );
    }

    return (
      <Card className={cn('w-full border-red-200 bg-red-50/50', className)}>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          {renderErrorContent()}
        </CardContent>
      </Card>
    );
  }

  if (isDialogVariant || isFullscreenVariant) {
    return (
      <div className={cn('relative w-full h-full bg-brand-gold-50', className)}>
        {renderCanvasArea()}
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'w-full overflow-hidden bg-white border border-[#E4D8C8]/70 shadow-sm',
        isMobile && 'border-none shadow-none rounded-none',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="relative w-full bg-brand-gold-50 overflow-hidden">
          {renderCanvasArea()}
        </div>
      </CardContent>
    </Card>
  );
};
