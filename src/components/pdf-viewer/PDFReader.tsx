import React, { useRef, useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';
import { PDFLoadingState } from './PDFLoadingState';
import { PDFErrorState } from './PDFErrorState';
import { PDFToolbar } from './PDFToolbar';
import { pdfOptions } from './PDFViewer';
import type { PDFMode } from './types';

interface PDFReaderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    pdfUrl: string;
    numPages: number | null;
    loading: boolean;
    progress: number;
    error: string | null;
    mode: PDFMode;
    attempt: number;
    nativeLoading: boolean;
    nativeError: string | null;
    scale: number;
    rotation: number;
    currentPage: number;
    canZoomIn: boolean;
    canZoomOut: boolean;
    canGoPrev: boolean;
    canGoNext: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    onLoadSuccess: (data: { numPages: number }) => void;
    onLoadError: () => void;
    onLoadProgress: (data: { loaded: number; total: number }) => void;
    onRetry: () => void;
    onNativeLoad: () => void;
    onNativeError: () => void;
    progressLabel: string;
    t: (key: string) => string;
}

/**
 * PDF Reader component - full-screen dialog for viewing PDFs
 */
export const PDFReader: React.FC<PDFReaderProps> = ({
    open,
    onOpenChange,
    pdfUrl,
    numPages,
    loading,
    progress,
    error,
    mode,
    attempt,
    nativeLoading,
    nativeError,
    scale,
    rotation,
    currentPage,
    canZoomIn,
    canZoomOut,
    canGoPrev,
    canGoNext,
    onZoomIn,
    onZoomOut,
    onRotate,
    onPrevPage,
    onNextPage,
    onLoadSuccess,
    onLoadError,
    onLoadProgress,
    onRetry,
    onNativeLoad,
    onNativeError,
    progressLabel,
    t,
}) => {
    const modalSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [modalWidth, setModalWidth] = useState<number | null>(null);

    useEffect(() => {
        if (!open) return;

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
    }, [open]);

    const shouldRenderDocument = mode === 'pdfjs' && open && !error;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="w-[calc(100vw-2rem)] max-w-[930px] overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl"
                style={{
                    maxHeight: 'calc(95vh - var(--sat, 0px) - var(--sab, 0px))',
                    height: 'calc(95vh - var(--sat, 0px) - var(--sab, 0px))',
                }}
                showCloseButton={false}
            >
                <DialogDescription className="sr-only">{t('pdf.viewer.fullscreenTitle')}</DialogDescription>
                <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white">
                    {/* Header */}
                    <header className="flex items-center justify-between border-b border-gray-100 px-3 sm:px-4 py-3 flex-shrink-0">
                        <div className="flex-1 min-w-0 mr-2">
                            <DialogTitle className="text-sm sm:text-base font-semibold text-[#222222] truncate">
                                {t('pdf.viewer.fullscreenTitle')}
                            </DialogTitle>
                            {numPages && (
                                <p className="text-xs text-muted-foreground">
                                    {t('pdf.viewer.page')} {currentPage} {t('pdf.viewer.of')} {numPages}
                                </p>
                            )}
                        </div>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-[#222222] touch-target flex-shrink-0"
                            onClick={() => onOpenChange(false)}
                            aria-label={t('pdf.viewer.close')}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </header>

                    {/* Content area */}
                    <div
                        ref={modalSurfaceRef}
                        className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[#F4F1EA] px-3 py-4"
                    >
                        {mode === 'pdfjs' ? (
                            shouldRenderDocument ? (
                                <Document
                                    key={`reader-${attempt}-${pdfUrl}`}
                                    file={pdfUrl}
                                    loading={null}
                                    error={null}
                                    onLoadProgress={onLoadProgress}
                                    onLoadSuccess={onLoadSuccess}
                                    onLoadError={onLoadError}
                                    options={pdfOptions}
                                    renderMode="canvas"
                                    className="w-full space-y-4"
                                >
                                    {/* Render all pages for scrolling */}
                                    {numPages &&
                                        Array.from(new Array(numPages), (_, index) => (
                                            <div key={`page-wrapper-${index + 1}`} className="flex justify-center w-full mb-4">
                                                <Page
                                                    pageNumber={index + 1}
                                                    width={modalWidth ? Math.max(modalWidth - 32, 280) : undefined}
                                                    scale={scale}
                                                    rotate={rotation}
                                                    renderAnnotationLayer={false}
                                                    renderTextLayer={false}
                                                    className="rounded-xl bg-white shadow-xl"
                                                />
                                            </div>
                                        ))}
                                </Document>
                            ) : error ? (
                                <PDFErrorState
                                    error={error}
                                    pdfUrl={pdfUrl}
                                    onRetry={onRetry}
                                    retryLabel={t('pdf.viewer.retry')}
                                    openExternalLabel={t('pdf.viewer.openExternal')}
                                />
                            ) : (
                                <Skeleton className="h-24 w-24 rounded-full" />
                            )
                        ) : (
                            <iframe
                                key={`reader-native-${attempt}-${pdfUrl}`}
                                src={`${pdfUrl}#view=fitH`}
                                title="PDF full view"
                                className="h-full w-full rounded-xl border-0 bg-white shadow-xl"
                                onLoad={onNativeLoad}
                                onError={onNativeError}
                                allowFullScreen
                            />
                        )}

                        {/* Loading states */}
                        {mode === 'pdfjs' && loading && shouldRenderDocument && (
                            <PDFLoadingState label={progressLabel} />
                        )}

                        {mode === 'native' && nativeLoading && <PDFLoadingState label={t('loading.pdf.viewer')} />}

                        {/* Native error state */}
                        {mode === 'native' && nativeError && (
                            <PDFErrorState
                                error={nativeError}
                                pdfUrl={pdfUrl}
                                onRetry={onRetry}
                                retryLabel={t('pdf.viewer.retry')}
                                openExternalLabel={t('pdf.viewer.openExternal')}
                            />
                        )}
                    </div>

                    {/* Toolbar */}
                    <PDFToolbar
                        pdfUrl={pdfUrl}
                        currentPage={currentPage}
                        numPages={numPages}
                        scale={scale}
                        rotation={rotation}
                        canZoomIn={canZoomIn}
                        canZoomOut={canZoomOut}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        onZoomIn={onZoomIn}
                        onZoomOut={onZoomOut}
                        onRotate={onRotate}
                        onPrevPage={onPrevPage}
                        onNextPage={onNextPage}
                        disabled={mode !== 'pdfjs'}
                        t={t}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
};
