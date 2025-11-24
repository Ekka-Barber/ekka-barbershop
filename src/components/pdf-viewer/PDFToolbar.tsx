import React from 'react';
import { Button } from '@/components/ui/button';
import {
    ChevronLeft,
    ChevronRight,
    Download,
    ExternalLink,
    Maximize2,
    RotateCcw,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';

interface PDFToolbarProps {
    pdfUrl: string;
    currentPage: number;
    numPages: number | null;
    scale: number;
    rotation: number;
    canZoomIn: boolean;
    canZoomOut: boolean;
    canGoPrev: boolean;
    canGoNext: boolean;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onRotate: () => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    disabled?: boolean;
    showMaximize?: boolean;
    onMaximize?: () => void;
    t: (key: string) => string;
}

/**
 * Toolbar component for PDF viewer with zoom, rotation, and navigation controls
 */
export const PDFToolbar: React.FC<PDFToolbarProps> = ({
    pdfUrl,
    currentPage,
    numPages,
    canZoomIn,
    canZoomOut,
    canGoPrev,
    canGoNext,
    onZoomIn,
    onZoomOut,
    onRotate,
    onPrevPage,
    onNextPage,
    disabled = false,
    showMaximize = false,
    onMaximize,
    t,
}) => {
    return (
        <footer className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3 border-t border-gray-100 bg-white px-3 sm:px-4 py-3 text-[#222222]">
            <div className="flex flex-1 flex-wrap items-center justify-center sm:justify-start gap-2">
                {showMaximize && onMaximize && (
                    <Button
                        size="sm"
                        className="bg-[#222222] text-white hover:bg-[#111111] touch-target"
                        onClick={onMaximize}
                    >
                        <Maximize2 className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('pdf.viewer.openFull')}</span>
                    </Button>
                )}

                <Button
                    size="icon"
                    variant="outline"
                    className="touch-target"
                    onClick={onZoomOut}
                    disabled={disabled || !canZoomOut}
                    aria-label={t('pdf.viewer.zoomOut')}
                >
                    <ZoomOut className="h-4 w-4" />
                </Button>

                <Button
                    size="icon"
                    variant="outline"
                    className="touch-target"
                    onClick={onZoomIn}
                    disabled={disabled || !canZoomIn}
                    aria-label={t('pdf.viewer.zoomIn')}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>

                <Button
                    size="icon"
                    variant="outline"
                    className="touch-target"
                    onClick={onRotate}
                    disabled={disabled}
                    aria-label={t('pdf.viewer.rotate')}
                >
                    <RotateCcw className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-sm font-medium min-h-[44px]">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10"
                        onClick={onPrevPage}
                        disabled={disabled || !canGoPrev}
                        aria-label={t('pdf.viewer.prev')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-xs sm:text-sm whitespace-nowrap">
                        {currentPage} / {numPages ?? '-'}
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10"
                        onClick={onNextPage}
                        disabled={disabled || !canGoNext}
                        aria-label={t('pdf.viewer.next')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <Button variant="ghost" size="sm" className="touch-target flex-1 sm:flex-initial" asChild>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">{t('pdf.viewer.openExternal')}</span>
                    </a>
                </Button>
                <Button size="sm" className="touch-target flex-1 sm:flex-initial" asChild>
                    <a href={pdfUrl} download className="flex items-center justify-center gap-2">
                        <Download className="h-4 w-4" />
                        <span className="text-xs sm:text-sm">{t('pdf.viewer.download')}</span>
                    </a>
                </Button>
            </div>
        </footer>
    );
};
