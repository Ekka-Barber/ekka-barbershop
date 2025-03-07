
import { useState, useEffect } from 'react';

interface ImageOptions {
  eager?: boolean;
  quality?: number;
  sizes?: string;
  preload?: boolean;
}

/**
 * Hook for optimized image loading with lazy loading and preloading support
 */
export const useOptimizedImage = (
  src: string,
  options: ImageOptions = {}
): { 
  optimizedSrc: string;
  blurPlaceholder?: string;
  isLoaded: boolean;
  imgProps: Record<string, any>;
} => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [blurPlaceholder, setBlurPlaceholder] = useState<string | undefined>(undefined);
  
  // Default options
  const {
    eager = false,
    quality = 80,
    sizes = '100vw',
    preload = false
  } = options;
  
  // Generate optimized props for image elements
  const imgProps = {
    loading: eager ? 'eager' : 'lazy',
    decoding: eager ? 'sync' : 'async',
    onLoad: () => setIsLoaded(true),
    onError: (e: any) => console.error('Image failed to load:', e),
  };
  
  // Support for WebP detection
  const isWebpSupported = () => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };
  
  // Preload critical images if needed
  useEffect(() => {
    if (preload) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.type = src.endsWith('.webp') ? 'image/webp' : 'image/png';
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, preload]);
  
  // Generate a simple blur placeholder for images
  useEffect(() => {
    if (!eager) {
      // Create simple color placeholder based on image URL
      // This is a simple hash function to generate consistent colors
      const hash = src.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
      }, 0);
      
      const r = Math.abs(hash % 255);
      const g = Math.abs((hash * 7) % 255);
      const b = Math.abs((hash * 13) % 255);
      const color = `rgba(${r}, ${g}, ${b}, 0.1)`;
      
      setBlurPlaceholder(`data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='${encodeURIComponent(color)}'/%3E%3C/svg%3E`);
    }
  }, [src, eager]);
  
  return {
    optimizedSrc: src,
    blurPlaceholder,
    isLoaded,
    imgProps
  };
};
