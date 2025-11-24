import { useState, useCallback } from 'react';
import { MIN_SCALE, MAX_SCALE, SCALE_STEP, clamp } from '../constants';

/**
 * Custom hook for PDF controls (zoom, rotation, page navigation)
 */
export function usePDFControls(numPages: number | null) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const handleZoom = useCallback((direction: 'in' | 'out') => {
        setScale((prev) =>
            clamp(prev + (direction === 'in' ? SCALE_STEP : -SCALE_STEP), MIN_SCALE, MAX_SCALE)
        );
    }, []);

    const handleRotate = useCallback(() => {
        setRotation((prev) => (prev + 90) % 360);
    }, []);

    const handlePageChange = useCallback((direction: 'prev' | 'next') => {
        setCurrentPage((prev) => {
            if (!numPages) return prev;
            if (direction === 'prev') {
                return Math.max(prev - 1, 1);
            }
            return Math.min(prev + 1, numPages);
        });
    }, [numPages]);

    const resetControls = useCallback(() => {
        setScale(1);
        setRotation(0);
        setCurrentPage(1);
    }, []);

    return {
        scale,
        rotation,
        currentPage,
        handleZoom,
        handleRotate,
        handlePageChange,
        resetControls,
        canZoomIn: scale < MAX_SCALE,
        canZoomOut: scale > MIN_SCALE,
        canGoPrev: currentPage > 1,
        canGoNext: numPages ? currentPage < numPages : false,
    };
}
