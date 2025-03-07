
import React, { useState, useEffect } from 'react';
import { useOptimizedImage } from '@/hooks/useOptimizedImage';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  eager?: boolean;
  width?: number;
  height?: number;
  className?: string;
  preload?: boolean;
  quality?: number;
  onLoad?: () => void;
}

/**
 * Optimized image component with lazy loading and blur-up effect
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  eager = false,
  width,
  height,
  className = '',
  preload = false,
  quality = 80,
  onLoad,
  ...rest
}) => {
  const [isIntersecting, setIsIntersecting] = useState(eager);
  const { optimizedSrc, blurPlaceholder, isLoaded, imgProps } = useOptimizedImage(src, {
    eager,
    quality,
    preload,
  });

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (eager) return;
    
    const element = document.getElementById(`lazy-img-${src.replace(/[^a-zA-Z0-9]/g, '')}`);
    if (!element) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      });
    }, {
      rootMargin: '200px', // Load images 200px before they enter the viewport
      threshold: 0.01
    });
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [src, eager]);
  
  // Handle load event
  const handleLoad = () => {
    if (onLoad) onLoad();
  };
  
  return (
    <div 
      id={`lazy-img-${src.replace(/[^a-zA-Z0-9]/g, '')}`}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {!isLoaded && blurPlaceholder && (
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: `url(${blurPlaceholder})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Actual image */}
      {(eager || isIntersecting) && (
        <img
          src={optimizedSrc}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding={eager ? 'sync' : 'async'}
          onLoad={handleLoad}
          {...rest}
        />
      )}
      
      {/* Fallback for no JavaScript */}
      <noscript>
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={className}
        />
      </noscript>
    </div>
  );
};

export default LazyImage;
