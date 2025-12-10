import React from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface PDFErrorStateProps {
    error: string;
    pdfUrl: string;
    onRetry: () => void;
    retryLabel: string;
    openExternalLabel: string;
}

/**
 * Error state component for PDF viewer
 */
export const PDFErrorState: React.FC<PDFErrorStateProps> = ({
    error,
    pdfUrl,
    onRetry,
    retryLabel,
    openExternalLabel,
}) => {
    const isJPXError = error === 'jpx_unsupported';

    const getErrorMessage = () => {
        if (isJPXError) {
            return "This PDF contains images that cannot be displayed in the browser. Please download to view.";
        }
        return error;
    };

    const getDownloadText = () => {
        if (isJPXError) {
            return "Download PDF";
        }
        return openExternalLabel;
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-white/85 px-6 text-center">
            <p className="text-base font-semibold text-[#8C1D18]">{getErrorMessage()}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
                {!isJPXError && (
                    <Button size="sm" variant="outline" onClick={onRetry}>
                        {retryLabel}
                    </Button>
                )}
                <Button size="sm" asChild>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={isJPXError ? "eco_ekka_compressed.pdf" : undefined}
                        className="flex items-center gap-2"
                    >
                        <ExternalLink className="h-4 w-4" />
                        {getDownloadText()}
                    </a>
                </Button>
            </div>
        </div>
    );
};
