
import React from 'react';
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
  // Determine whether to load lazily based on priority flag
  const loadingStrategy = priority ? 'eager' : 'lazy';
  
  // Determine final sources to use
  const finalWebpSrc = webpSrc || src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const finalFallbackSrc = fallbackSrc || src;
  
  // If webp conversion isn't actually available, just use the normal src
  const hasWebp = finalWebpSrc !== src;

  return (
    <>
      {hasWebp ? (
        <picture>
          <source srcSet={finalWebpSrc} type="image/webp" />
          <source srcSet={finalFallbackSrc} type={`image/${src.split('.').pop()?.toLowerCase() || 'jpeg'}`} />
          <img
            src={finalFallbackSrc}
            alt={alt}
            loading={loadingStrategy}
            width={width}
            height={height}
            className={cn("max-w-full", className)}
            decoding={priority ? "sync" : "async"}
            {...props}
          />
        </picture>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={loadingStrategy}
          width={width}
          height={height}
          className={cn("max-w-full", className)}
          decoding={priority ? "sync" : "async"}
          {...props}
        />
      )}
    </>
  );
};
