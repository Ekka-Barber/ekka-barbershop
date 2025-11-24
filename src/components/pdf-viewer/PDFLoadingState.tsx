import React from 'react';

interface PDFLoadingStateProps {
    label: string;
}

/**
 * Loading state component for PDF viewer
 */
export const PDFLoadingState: React.FC<PDFLoadingStateProps> = ({ label }) => {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#C4A36F] border-t-transparent" />
            <p className="text-sm font-medium text-[#222222]">{label}</p>
        </div>
    );
};
