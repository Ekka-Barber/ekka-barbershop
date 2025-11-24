/**
 * Shared types for PDF Viewer components
 */

export interface PDFViewerProps {
    pdfUrl: string;
    height?: string;
    className?: string;
    variant?: 'default' | 'dialog';
}

export type PDFMode = 'pdfjs' | 'native';

export interface PDFDocumentState {
    numPages: number | null;
    loading: boolean;
    progress: number;
    error: string | null;
    attempt: number;
    mode: PDFMode;
    nativeLoading: boolean;
    nativeError: string | null;
}
