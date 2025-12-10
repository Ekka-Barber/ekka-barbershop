import { useState, useCallback, useEffect } from 'react';
import type { PDFMode } from '../types';

interface UsePDFDocumentProps {
    pdfUrl: string;
    t: (key: string) => string;
}

/**
 * Custom hook for managing PDF document state (loading, errors, mode switching)
 */
export function usePDFDocument({ pdfUrl, t }: UsePDFDocumentProps) {
    const [numPages, setNumPages] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [attempt, setAttempt] = useState(0);
    const [mode, setMode] = useState<PDFMode>('pdfjs');
    const [nativeLoading, setNativeLoading] = useState(false);
    const [nativeError, setNativeError] = useState<string | null>(null);

    // Reset state when PDF URL changes
    useEffect(() => {
        setLoading(true);
        setProgress(0);
        setError(null);
        setMode('pdfjs');
        setNativeLoading(false);
        setNativeError(null);
        setNumPages(null);
        setAttempt((prev) => prev + 1);
    }, [pdfUrl]);

    const handleLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
        setError(null);
    }, []);

    const handleLoadError = useCallback((error?: Error | unknown) => {
        setLoading(false);

        // Check if the error is related to JPEG 2000 decoding
        const isJPXError = error?.message?.includes('JpxImage') ||
                          error?.message?.includes('OpenJPEG') ||
                          error?.message?.includes('JPEG 2000') ||
                          error?.message?.includes('JPX');

        if (mode === 'pdfjs' && !isJPXError) {
            // Try native mode as fallback for non-JPX errors
            setError(null);
            setMode('native');
            setNativeLoading(true);
            setNativeError(null);
            return;
        }

        // For JPX errors or when native mode also fails, show download fallback
        if (isJPXError) {
            setError('jpx_unsupported');
        } else {
            setError(t('pdf.viewer.failed'));
        }
    }, [mode, t]);

    const handleRetry = useCallback(() => {
        if (mode === 'pdfjs') {
            setLoading(true);
            setError(null);
            setProgress(0);
            setAttempt((prev) => prev + 1);
        } else {
            setNativeLoading(true);
            setNativeError(null);
            setAttempt((prev) => prev + 1);
        }
    }, [mode]);

    const handleNativeLoad = useCallback(() => {
        setNativeLoading(false);
        setNativeError(null);
    }, []);

    const handleNativeError = useCallback(() => {
        setNativeLoading(false);
        setNativeError(t('pdf.viewer.failed'));
    }, [t]);

    return {
        numPages,
        loading,
        progress,
        error,
        attempt,
        mode,
        nativeLoading,
        nativeError,
        setProgress,
        handleLoadSuccess,
        handleLoadError,
        handleRetry,
        handleNativeLoad,
        handleNativeError,
    };
}
