import React, { useRef, useEffect, useState } from 'react';
import { Document, Page } from 'react-pdf';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { PDFLoadingState } from './PDFLoadingState';
import { PDFErrorState } from './PDFErrorState';
import type { PDFMode } from './types';

interface PDFPreviewProps {
    pdfUrl: string;
    variant: 'default' | 'dialog';
    numPages: number | null;
    loading: boolean;
    progress: number;
    error: string | null;
    mode: PDFMode;
    attempt: number;
    nativeLoading: boolean;
    nativeError: string | null;
    isFullHeight: boolean;
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
 * PDF Preview component - handles rendering in preview mode (single page or all pages)
 */
export const PDFPreview: React.FC<PDFPreviewProps> = ({
    pdfUrl,
    variant,
    numPages,
    loading,
    progress,
    error,
    mode,
    attempt,
    nativeLoading,
    nativeError,
    isFullHeight,
    onLoadSuccess,
    onLoadError,
    onLoadProgress,
    onRetry,
    onNativeLoad,
    onNativeError,
    progressLabel,
    t,
}) => {
    const previewSurfaceRef = useRef<HTMLDivElement | null>(null);
    const [previewWidth, setPreviewWidth] = useState<number | null>(null);

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

    const shouldRenderDocument = mode === 'pdfjs' && !error;

    return (
        <div
            ref={previewSurfaceRef}
            className={cn(
                'px-3 py-4',
                variant !== 'dialog' && 'overflow-auto',
                variant === 'dialog' && 'px-0 py-2',
                isFullHeight && 'h-full'
            )}
        >
            <div className={cn('flex w-full items-center justify-center min-h-full', isFullHeight && 'h-full')}>
                {mode === 'pdfjs' ? (
                    shouldRenderDocument ? (
                        <Document
                            key={`preview-${attempt}-${pdfUrl}`}
                            file={pdfUrl}
                            loading={null}
                            error={null}
                            onLoadProgress={onLoadProgress}
                            onLoadSuccess={onLoadSuccess}
                            onLoadError={onLoadError}
                            renderMode="canvas"
                            className={cn('flex flex-col items-center justify-start gap-4', isFullHeight && 'h-full')}
                        >
                            {/* Render all pages for scrolling in dialog mode */}
                            {variant === 'dialog' && numPages ? (
                                Array.from(new Array(numPages), (_, index) => (
                                    <Page
                                        key={`preview-page-${index + 1}`}
                                        pageNumber={index + 1}
                                        width={previewWidth ? Math.max(previewWidth - (variant === 'dialog' ? 0 : 32), 280) : undefined}
                                        className={cn('!m-0 rounded-lg bg-white shadow-lg')}
                                        renderAnnotationLayer={false}
                                        renderTextLayer={false}
                                    />
                                ))
                            ) : (
                                <Page
                                    pageNumber={1}
                                    width={previewWidth ?? undefined}
                                    className={cn('!m-0 rounded-lg bg-white shadow-lg', isFullHeight && 'h-full')}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                />
                            )}
                        </Document>
                    ) : (
                        <Skeleton className={isFullHeight ? 'h-full w-full rounded-xl' : 'h-[280px] w-full rounded-xl'} />
                    )
                ) : (
                    <iframe
                        key={`preview-native-${attempt}-${pdfUrl}`}
                        src={`${pdfUrl}#toolbar=0&navpanes=0&view=fitH`}
                        title="PDF preview"
                        className={
                            isFullHeight
                                ? 'h-full w-full rounded-xl border-0 bg-white shadow-lg'
                                : 'h-[420px] w-full rounded-xl border-0 bg-white shadow-lg lg:h-[520px]'
                        }
                        onLoad={onNativeLoad}
                        onError={onNativeError}
                        allowFullScreen
                    />
                )}
            </div>

            {/* Loading state */}
            {mode === 'pdfjs' && loading && shouldRenderDocument && (
                <PDFLoadingState label={progressLabel} />
            )}

            {mode === 'native' && nativeLoading && <PDFLoadingState label={t('loading.pdf.viewer')} />}

            {/* Error states */}
            {mode === 'pdfjs' && error && (
                <PDFErrorState
                    error={error}
                    pdfUrl={pdfUrl}
                    onRetry={onRetry}
                    retryLabel={t('pdf.viewer.retry')}
                    openExternalLabel={t('pdf.viewer.openExternal')}
                />
            )}

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
    );
};
