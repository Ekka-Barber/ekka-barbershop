import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useLanguage } from '@/contexts/LanguageContext';

// Configure PDF.js worker and disable JPX decoding to prevent WebAssembly warnings
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Disable JPX image decoding to prevent WebAssembly initialization warnings
// This helps suppress "JpxImage#instantiateWasm: UnknownErrorException" warnings
if (typeof window !== 'undefined') {
  // Override console.warn to suppress PDF.js JPX warnings
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('JpxImage') ||
        message.includes('OpenJPEG failed') ||
        message.includes('Failed to resolve module specifier') ||
        message.includes('Unable to decode image')) {
      // Suppress these specific PDF.js warnings
      return;
    }
    originalWarn.apply(console, args);
  };
}
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Maximize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PDFViewerProps {
  pdfUrl: string;
  height?: string;
  className?: string;
  variant?: 'default' | 'dialog';
}

const MIN_SCALE = 0.75;
const MAX_SCALE = 2.5;
const SCALE_STEP = 0.2;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const PDFViewer = ({ pdfUrl, height, className, variant = 'default' }: PDFViewerProps) => {
  const { t } = useLanguage();
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null);
  const modalSurfaceRef = useRef<HTMLDivElement | null>(null);

  const [previewWidth, setPreviewWidth] = useState<number | null>(null);
  const [modalWidth, setModalWidth] = useState<number | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewProgress, setPreviewProgress] = useState(0);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewAttempt, setPreviewAttempt] = useState(0);

  const [readerLoading, setReaderLoading] = useState(true);
  const [readerProgress, setReaderProgress] = useState(0);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [readerAttempt, setReaderAttempt] = useState(0);

  const [previewMode, setPreviewMode] = useState<'pdfjs' | 'native'>('pdfjs');
  const [modalMode, setModalMode] = useState<'pdfjs' | 'native'>('pdfjs');
  const [nativePreviewLoading, setNativePreviewLoading] = useState(false);
  const [nativePreviewError, setNativePreviewError] = useState<string | null>(null);
  const [nativeModalLoading, setNativeModalLoading] = useState(false);
  const [nativeModalError, setNativeModalError] = useState<string | null>(null);

  const resolvedMinHeight = height ?? '360px';
  const isFullHeight = height === '100%';

  useEffect(() => {
    setPreviewLoading(true);
    setPreviewProgress(0);
    setPreviewError(null);
    setPreviewMode('pdfjs');
    setNativePreviewLoading(false);
    setNativePreviewError(null);
    setReaderLoading(true);
    setReaderProgress(0);
    setReaderError(null);
    setModalMode('pdfjs');
    setNativeModalLoading(false);
    setNativeModalError(null);
    setScale(1);
    setRotation(0);
    setCurrentPage(1);
    setNumPages(null);
    setPreviewAttempt((prev) => prev + 1);
    setReaderAttempt((prev) => prev + 1);
  }, [pdfUrl]);

  useEffect(() => {
    const node = previewContainerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setIsPreviewVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsPreviewVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const surface = previewSurfaceRef.current;
    if (!surface) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? null;
      if (width) {
        setPreviewWidth(width);
      }
    });

    observer.observe(surface);
    setPreviewWidth(surface.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;
    setReaderLoading(true);
    setReaderProgress(0);
    setReaderError(null);

    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const surface = modalSurfaceRef.current;
    if (!surface) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? null;
      if (width) {
        setModalWidth(width);
      }
    });

    observer.observe(surface);
    setModalWidth(surface.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, [isModalOpen]);

  useEffect(() => {
    if (numPages && currentPage > numPages) {
      setCurrentPage(numPages);
    }
  }, [numPages, currentPage]);

  const handlePreviewLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPreviewLoading(false);
      setPreviewError(null);
    },
    []
  );

  const handleReaderLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setReaderLoading(false);
      setReaderError(null);
    },
    []
  );

  const handlePreviewError = useCallback(() => {
    setPreviewLoading(false);
    if (previewMode === 'pdfjs') {
      setPreviewError(null);
      setPreviewMode('native');
      setNativePreviewLoading(true);
      setNativePreviewError(null);
      return;
    }
    setPreviewError(t('pdf.viewer.failed'));
  }, [previewMode, t]);

  const handleReaderError = useCallback(() => {
    setReaderLoading(false);
    if (modalMode === 'pdfjs') {
      setReaderError(null);
      setModalMode('native');
      setNativeModalLoading(true);
      setNativeModalError(null);
      return;
    }
    setReaderError(t('pdf.viewer.failed'));
  }, [modalMode, t]);

  const handlePreviewRetry = () => {
    if (previewMode === 'pdfjs') {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewProgress(0);
      setPreviewAttempt((prev) => prev + 1);
    } else {
      setNativePreviewLoading(true);
      setNativePreviewError(null);
      setPreviewAttempt((prev) => prev + 1);
    }
  };

  const handleReaderRetry = () => {
    if (modalMode === 'pdfjs') {
      setReaderLoading(true);
      setReaderError(null);
      setReaderProgress(0);
      setReaderAttempt((prev) => prev + 1);
    } else {
      setNativeModalLoading(true);
      setNativeModalError(null);
      setReaderAttempt((prev) => prev + 1);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setScale((prev) =>
      clamp(prev + (direction === 'in' ? SCALE_STEP : -SCALE_STEP), MIN_SCALE, MAX_SCALE)
    );
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handlePageChange = (direction: 'prev' | 'next') => {
    setCurrentPage((prev) => {
      if (!numPages) return prev;
      if (direction === 'prev') {
        return Math.max(prev - 1, 1);
      }
      return Math.min(prev + 1, numPages);
    });
  };

  const progressLabel = useMemo(() => {
    if (previewProgress <= 0) return t('loading.pdf.viewer');
    return `${t('loading.pdf.viewer')} - ${previewProgress}%`;
  }, [previewProgress, t]);

  const readerProgressLabel = useMemo(() => {
    if (readerProgress <= 0) return t('loading.pdf.viewer');
    return `${t('loading.pdf.viewer')} - ${readerProgress}%`;
  }, [readerProgress, t]);

  const shouldRenderPreviewDocument = previewMode === 'pdfjs' && isPreviewVisible && !previewError;
  const shouldRenderReaderDocument = modalMode === 'pdfjs' && isModalOpen && !readerError;

  return (
    <>
      <div
        ref={previewContainerRef}
        className={cn(
          "relative w-full rounded-2xl border border-[#E4D8C8] bg-[#FBF7F2] shadow-sm",
          variant === 'dialog' && "h-full rounded-xl border border-transparent bg-transparent shadow-none",
          className
        )}
        style={isFullHeight ? { height: '100%' } : { minHeight: resolvedMinHeight }}
      >
        <div ref={previewSurfaceRef} className={cn("px-3 py-4", isFullHeight && "h-full")}>
          <div className={cn("flex w-full items-center justify-center", isFullHeight && "h-full")}>
            {previewMode === 'pdfjs' ? (
              shouldRenderPreviewDocument ? (
                <Document
                  key={`preview-${previewAttempt}-${pdfUrl}`}
                  file={pdfUrl}
                  loading={null}
                  error={null}
                  onLoadProgress={({ loaded, total }) => {
                    if (total) {
                      setPreviewProgress(Math.min(100, Math.round((loaded / total) * 100)));
                    }
                  }}
                  onLoadSuccess={handlePreviewLoadSuccess}
                  onLoadError={handlePreviewError}
                  renderMode="canvas"
                  className={cn("flex items-center justify-center", isFullHeight && "h-full")}
                >
                  <Page
                    pageNumber={1}
                    width={previewWidth ?? undefined}
                    className={cn("!m-0 rounded-lg bg-white shadow-lg", isFullHeight && "h-full")}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                </Document>
              ) : (
                <Skeleton className={isFullHeight ? "h-full w-full rounded-xl" : "h-[280px] w-full rounded-xl"} />
              )
            ) : (
              <iframe
                key={`preview-native-${previewAttempt}-${pdfUrl}`}
                src={`${pdfUrl}#toolbar=0&navpanes=0&view=fitH`}
                title="PDF preview"
                className={isFullHeight ? "h-full w-full rounded-xl border-0 bg-white shadow-lg" : "h-[420px] w-full rounded-xl border-0 bg-white shadow-lg lg:h-[520px]"}
                onLoad={() => {
                  setNativePreviewLoading(false);
                  setNativePreviewError(null);
                }}
                onError={() => {
                  setNativePreviewLoading(false);
                  setNativePreviewError(t('pdf.viewer.failed'));
                }}
                allowFullScreen
              />
            )}
          </div>
        </div>

        {previewMode === 'pdfjs' && previewLoading && shouldRenderPreviewDocument && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C4A36F] border-t-transparent" />
            <p className="text-sm font-medium text-[#222222]">{progressLabel}</p>
          </div>
        )}

        {previewMode === 'native' && nativePreviewLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C4A36F] border-t-transparent" />
            <p className="text-sm font-medium text-[#222222]">{t('loading.pdf.viewer')}</p>
          </div>
        )}

        {previewMode === 'pdfjs' && previewError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/85 px-6 text-center">
            <p className="text-base font-semibold text-[#8C1D18]">
              {previewError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="sm" variant="outline" onClick={handlePreviewRetry}>
                {t('pdf.viewer.retry')}
              </Button>
              <Button size="sm" asChild>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('pdf.viewer.openExternal')}
                </a>
              </Button>
            </div>
          </div>
        )}

        {previewMode === 'native' && nativePreviewError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/85 px-6 text-center">
            <p className="text-base font-semibold text-[#8C1D18]">
              {nativePreviewError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="sm" variant="outline" onClick={handlePreviewRetry}>
                {t('pdf.viewer.retry')}
              </Button>
              <Button size="sm" asChild>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  {t('pdf.viewer.openExternal')}
                </a>
              </Button>
            </div>
          </div>
        )}

      </div>

      {variant !== 'dialog' && (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="w-[min(100vw-1rem,930px)] max-h-[95vh] overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl"
          showCloseButton={false}
        >
          <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
            <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div>
                <p className="text-base font-semibold text-[#222222]">
                  {t('pdf.viewer.fullscreenTitle')}
                </p>
                {numPages && (
                  <p className="text-xs text-muted-foreground">
                    {t('pdf.viewer.page')} {currentPage} {t('pdf.viewer.of')} {numPages}
                  </p>
                )}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="text-[#222222]"
                onClick={() => setIsModalOpen(false)}
                aria-label={t('pdf.viewer.close')}
              >
                <X className="h-5 w-5" />
              </Button>
            </header>

            <div
              ref={modalSurfaceRef}
              className="relative flex flex-1 items-center justify-center overflow-auto bg-[#F4F1EA] px-3 py-4"
            >
              {modalMode === 'pdfjs' ? (
                shouldRenderReaderDocument ? (
                  <Document
                    key={`reader-${readerAttempt}-${pdfUrl}`}
                    file={pdfUrl}
                    loading={null}
                    error={null}
                    onLoadProgress={({ loaded, total }) => {
                      if (total) {
                        setReaderProgress(Math.min(100, Math.round((loaded / total) * 100)));
                      }
                    }}
                    onLoadSuccess={handleReaderLoadSuccess}
                    onLoadError={handleReaderError}
                    renderMode="canvas"
                    className="flex items-center justify-center"
                  >
                    <Page
                      pageNumber={currentPage}
                      width={modalWidth ? Math.max(modalWidth - 16, 280) : undefined}
                      scale={scale}
                      rotate={rotation}
                      renderAnnotationLayer={false}
                      renderTextLayer={false}
                      className="!m-0 rounded-xl bg-white shadow-xl"
                    />
                  </Document>
                ) : readerError ? (
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-base font-semibold text-[#8C1D18]">{readerError}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <Button variant="outline" onClick={handleReaderRetry}>
                        {t('pdf.viewer.retry')}
                      </Button>
                      <Button asChild>
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          {t('pdf.viewer.openExternal')}
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-24 w-24 rounded-full" />
                )
              ) : (
                <iframe
                  key={`reader-native-${readerAttempt}-${pdfUrl}`}
                  src={`${pdfUrl}#view=fitH`}
                  title="PDF full view"
                  className="h-full w-full rounded-xl border-0 bg-white shadow-xl"
                  onLoad={() => {
                    setNativeModalLoading(false);
                    setNativeModalError(null);
                  }}
                  onError={() => {
                    setNativeModalLoading(false);
                    setNativeModalError(t('pdf.viewer.failed'));
                  }}
                  allowFullScreen
                />
              )}

              {modalMode === 'pdfjs' && readerLoading && shouldRenderReaderDocument && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C4A36F] border-t-transparent" />
                  <p className="text-sm font-medium text-[#222222]">{readerProgressLabel}</p>
                </div>
              )}

              {modalMode === 'native' && nativeModalLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
                  <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C4A36F] border-t-transparent" />
                  <p className="text-sm font-medium text-[#222222]">{t('loading.pdf.viewer')}</p>
                </div>
              )}

              {modalMode === 'native' && nativeModalError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/90 px-6 text-center">
                  <p className="text-base font-semibold text-[#8C1D18]">{nativeModalError}</p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button variant="outline" onClick={handleReaderRetry}>
                      {t('pdf.viewer.retry')}
                    </Button>
                    <Button asChild>
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {t('pdf.viewer.openExternal')}
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <footer className="flex flex-wrap items-center gap-3 border-t border-gray-100 bg-white px-4 py-3 text-[#222222]">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  className="bg-[#222222] text-white hover:bg-[#111111] min-h-[44px] touch-target"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Maximize2 className="h-4 w-4" />
                  {t('pdf.viewer.openFull')}
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleZoom('out')}
                  disabled={modalMode !== 'pdfjs' || scale <= MIN_SCALE}
                  aria-label={t('pdf.viewer.zoomOut')}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handleZoom('in')}
                  disabled={modalMode !== 'pdfjs' || scale >= MAX_SCALE}
                  aria-label={t('pdf.viewer.zoomIn')}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleRotate}
                  disabled={modalMode !== 'pdfjs'}
                  aria-label={t('pdf.viewer.rotate')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm font-medium">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePageChange('prev')}
                    disabled={modalMode !== 'pdfjs' || currentPage <= 1}
                    aria-label={t('pdf.viewer.prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-sm">
                    {currentPage} / {numPages ?? '-'}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handlePageChange('next')}
                    disabled={modalMode !== 'pdfjs' || !numPages || currentPage >= numPages}
                    aria-label={t('pdf.viewer.next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" size="sm" className="min-h-[44px] touch-target" asChild>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {t('pdf.viewer.openExternal')}
                  </a>
                </Button>
                <Button size="sm" className="min-h-[44px] touch-target" asChild>
                  <a href={pdfUrl} download className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    {t('pdf.viewer.download')}
                  </a>
                </Button>
              </div>
            </footer>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
};

export default memo(PDFViewer);
