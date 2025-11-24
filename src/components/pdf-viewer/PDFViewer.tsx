import React, { memo, useEffect, useMemo, useState, useRef } from 'react';
import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { PDFPreview } from './PDFPreview';
import { PDFReader } from './PDFReader';
import { usePDFDocument } from './hooks/usePDFDocument';
import { usePDFControls } from './hooks/usePDFControls';
import type { PDFViewerProps } from './types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// Suppress PDF.js JPX warnings
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        const message = args.join(' ');
        if (
            message.includes('JpxImage') ||
            message.includes('OpenJPEG failed') ||
            message.includes('Failed to resolve module specifier') ||
            message.includes('Unable to decode image')
        ) {
            return;
        }
        originalWarn.apply(console, args);
    };
}

/**
 * Main PDF Viewer component - orchestrates preview and reader modes
 * Refactored into smaller, focused sub-components for better maintainability
 */
const PDFViewer = ({ pdfUrl, height, className, variant = 'default' }: PDFViewerProps) => {
    const { t } = useLanguage();
    const previewContainerRef = useRef<HTMLDivElement | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const resolvedMinHeight = height ?? '360px';
    const isFullHeight = height === '100%';

    // Use custom hooks for state management
    const previewDoc = usePDFDocument({ pdfUrl, t });
    const readerDoc = usePDFDocument({ pdfUrl, t });
    const controls = usePDFControls(previewDoc.numPages);

    // Reset controls when modal opens
    useEffect(() => {
        if (isModalOpen) {
            controls.resetControls();
        }
    }, [isModalOpen, controls]);

    // Keep current page in bounds
    useEffect(() => {
        if (previewDoc.numPages && controls.currentPage > previewDoc.numPages) {
            controls.handlePageChange('prev');
        }
    }, [previewDoc.numPages, controls]);

    // Progress labels
    const progressLabel = useMemo(() => {
        if (previewDoc.progress <= 0) return t('loading.pdf.viewer');
        return `${t('loading.pdf.viewer')} - ${previewDoc.progress}%`;
    }, [previewDoc.progress, t]);

    const readerProgressLabel = useMemo(() => {
        if (readerDoc.progress <= 0) return t('loading.pdf.viewer');
        return `${t('loading.pdf.viewer')} - ${readerDoc.progress}%`;
    }, [readerDoc.progress, t]);

    return (
        <>
            <div
                ref={previewContainerRef}
                className={cn(
                    'relative w-full rounded-2xl border border-[#E4D8C8] bg-[#FBF7F2] shadow-sm',
                    variant === 'dialog' && 'rounded-xl border border-transparent bg-transparent shadow-none',
                    isFullHeight && 'h-full',
                    className
                )}
                style={isFullHeight ? { height: '100%' } : { minHeight: resolvedMinHeight }}
            >
                <PDFPreview
                    pdfUrl={pdfUrl}
                    variant={variant}
                    numPages={previewDoc.numPages}
                    loading={previewDoc.loading}
                    progress={previewDoc.progress}
                    error={previewDoc.error}
                    mode={previewDoc.mode}
                    attempt={previewDoc.attempt}
                    nativeLoading={previewDoc.nativeLoading}
                    nativeError={previewDoc.nativeError}
                    isFullHeight={isFullHeight}
                    onLoadSuccess={previewDoc.handleLoadSuccess}
                    onLoadError={previewDoc.handleLoadError}
                    onLoadProgress={({ loaded, total }) => {
                        if (total) {
                            previewDoc.setProgress(Math.min(100, Math.round((loaded / total) * 100)));
                        }
                    }}
                    onRetry={previewDoc.handleRetry}
                    onNativeLoad={previewDoc.handleNativeLoad}
                    onNativeError={previewDoc.handleNativeError}
                    progressLabel={progressLabel}
                    t={t}
                />
            </div>

            {/* Full-screen reader dialog (only for non-dialog variant) */}
            {variant !== 'dialog' && (
                <PDFReader
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    pdfUrl={pdfUrl}
                    numPages={readerDoc.numPages}
                    loading={readerDoc.loading}
                    progress={readerDoc.progress}
                    error={readerDoc.error}
                    mode={readerDoc.mode}
                    attempt={readerDoc.attempt}
                    nativeLoading={readerDoc.nativeLoading}
                    nativeError={readerDoc.nativeError}
                    scale={controls.scale}
                    rotation={controls.rotation}
                    currentPage={controls.currentPage}
                    canZoomIn={controls.canZoomIn}
                    canZoomOut={controls.canZoomOut}
                    canGoPrev={controls.canGoPrev}
                    canGoNext={controls.canGoNext}
                    onZoomIn={() => controls.handleZoom('in')}
                    onZoomOut={() => controls.handleZoom('out')}
                    onRotate={controls.handleRotate}
                    onPrevPage={() => controls.handlePageChange('prev')}
                    onNextPage={() => controls.handlePageChange('next')}
                    onLoadSuccess={readerDoc.handleLoadSuccess}
                    onLoadError={readerDoc.handleLoadError}
                    onLoadProgress={({ loaded, total }) => {
                        if (total) {
                            readerDoc.setProgress(Math.min(100, Math.round((loaded / total) * 100)));
                        }
                    }}
                    onRetry={readerDoc.handleRetry}
                    onNativeLoad={readerDoc.handleNativeLoad}
                    onNativeError={readerDoc.handleNativeError}
                    progressLabel={readerProgressLabel}
                    t={t}
                />
            )}
        </>
    );
};

export default memo(PDFViewer);
