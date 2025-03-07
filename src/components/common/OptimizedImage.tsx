
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  webpSrc?: string;
  fallbackSrc?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  priority?: boolean;
  lazyBoundary?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  webpSrc,
  fallbackSrc,
  width,
  height,
  className,
  priority = false,
  lazyBoundary = '200px',
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Determine whether to load lazily based on priority flag
  const loadingStrategy = priority ? 'eager' : 'lazy';
  
  // Ensure src is a valid path (remove double slashes)
  const normalizePath = (path: string) => {
    // If the path is an absolute URL, return it as is
    if (path.startsWith('http')) {
      return path;
    }
    // Clean up paths that might have double slashes
    return path.startsWith('/') ? path : `/${path}`;
  };
  
  const cleanSrc = normalizePath(src);
  const finalFallbackSrc = fallbackSrc ? normalizePath(fallbackSrc) : cleanSrc;
  
  // Only attempt WebP conversion for compatible image types
  const canConvertToWebp = cleanSrc.match(/\.(jpg|jpeg|png)$/i);
  const finalWebpSrc = webpSrc 
    ? normalizePath(webpSrc) 
    : (canConvertToWebp ? cleanSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp') : null);
  
  // Only use picture with WebP if we actually have WebP conversion
  const hasWebp = finalWebpSrc !== null && finalWebpSrc !== cleanSrc;

  // Extract file extension for MIME type
  const getFileExtension = (path: string) => {
    const match = path.match(/\.([a-z0-9]+)(?:\?.*)?$/i);
    return match ? match[1].toLowerCase() : 'jpeg';
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    console.error(`Image failed to load: ${finalFallbackSrc}`);
    setHasError(true);
  };

  // Placeholder for error state
  if (hasError) {
    return (
      <div 
        className={cn(
          "flex items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 rounded",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-xs">Image Error</span>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative inline-block overflow-hidden",
        !isLoaded && "bg-gray-100 animate-pulse",
        className
      )}
      style={{ width, height }}
    >
      {hasWebp ? (
        <picture>
          <source srcSet={finalWebpSrc} type="image/webp" />
          <source srcSet={finalFallbackSrc} type={`image/${getFileExtension(finalFallbackSrc)}`} />
          <img
            src={finalFallbackSrc}
            alt={alt}
            loading={loadingStrategy}
            width={width}
            height={height}
            className={cn("max-w-full h-auto", className)}
            decoding={priority ? "sync" : "async"}
            onLoad={handleLoad}
            onError={handleError}
            {...props}
          />
        </picture>
      ) : (
        <img
          src={finalFallbackSrc}
          alt={alt}
          loading={loadingStrategy}
          width={width}
          height={height}
          className={cn("max-w-full h-auto", className)}
          decoding={priority ? "sync" : "async"}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
};
