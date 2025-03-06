
import React, { useState, useEffect, useRef } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { prefersReducedMotion } from '@/services/platformDetection';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  backgroundColor?: string;
  pullingContent?: React.ReactNode;
  refreshingContent?: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  backgroundColor = 'white',
  pullingContent,
  refreshingContent,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number | null>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startYRef.current !== null) {
        currentYRef.current = e.touches[0].clientY;
        const delta = currentYRef.current - startYRef.current;
        
        // Only activate pull-to-refresh if scrolled to top and pulling down
        if (delta > 0 && container.scrollTop <= 0) {
          const newDistance = Math.min(delta * 0.5, maxPullDownDistance);
          setPullDistance(newDistance);
          setIsPulling(true);
          
          // Prevent default scrolling
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling) {
        if (pullDistance >= pullDownThreshold) {
          setIsRefreshing(true);
          setPullDistance(0);
          setIsPulling(false);
          
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
          }
        } else {
          setPullDistance(0);
          setIsPulling(false);
        }
        
        startYRef.current = null;
        currentYRef.current = null;
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isPulling, pullDistance, pullDownThreshold, maxPullDownDistance, onRefresh]);

  // Default pulling content
  const defaultPullingContent = (
    <div className="flex items-center justify-center text-gray-500">
      <ArrowDownUp className={`mr-2 ${pullDistance >= pullDownThreshold ? 'text-green-500' : ''}`} />
      <span>{pullDistance >= pullDownThreshold ? 'Release to refresh' : 'Pull down to refresh'}</span>
    </div>
  );

  // Default refreshing content
  const defaultRefreshingContent = (
    <div className="flex items-center justify-center text-gray-500">
      <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-primary rounded-full mr-2" />
      <span>Refreshing...</span>
    </div>
  );

  return (
    <div className="h-full w-full overflow-hidden" style={{ position: 'relative', backgroundColor }}>
      {(isPulling || isRefreshing) && (
        <div
          className="absolute w-full flex items-center justify-center z-10 pointer-events-none overflow-hidden transition-all duration-200"
          style={{ 
            height: isPulling ? `${pullDistance}px` : isRefreshing ? '60px' : '0px',
            top: 0,
            transform: reducedMotion ? 'none' : undefined,
          }}
        >
          {isPulling ? 
            (pullingContent || defaultPullingContent) : 
            (refreshingContent || defaultRefreshingContent)}
        </div>
      )}
      
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto"
        style={{
          transition: reducedMotion ? 'none' : 'transform 0.2s ease',
          transform: isPulling ? `translateY(${pullDistance}px)` : 
                    isRefreshing ? 'translateY(60px)' : 'translateY(0px)',
        }}
      >
        {children}
      </div>
    </div>
  );
};
