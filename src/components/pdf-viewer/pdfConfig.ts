import { pdfjs } from 'react-pdf';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

// PDF.js configuration options for Document components
// These are passed to Document components via options prop, not GlobalWorkerOptions
export const pdfOptions = {
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

// Suppress PDF.js JPX warnings but allow important errors
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        const message = args.join(' ');
        if (
            message.includes('JpxImage') ||
            message.includes('OpenJPEG failed') ||
            message.includes('Failed to resolve module specifier') ||
            message.includes('Unable to decode image') ||
            message.includes('Dependent image isn\'t ready yet')
        ) {
            return; // Suppress these specific warnings
        }
        originalWarn.apply(console, args);
    };
}
