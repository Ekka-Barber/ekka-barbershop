
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
  disabled?: boolean; // New prop to disable pull-to-refresh
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  backgroundColor = 'white',
  pullingContent,
  refreshingContent,
  disabled = false,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number | null>(null);
  const scrollStartPosRef = useRef(0);
  const reducedMotion = prefersReducedMotion();
  // Track if user intended to scroll rather than pull
  const isScrollingRef = useRef(false);
  // Track the initial touch to determine pull vs scroll intent
  const initialTouchTimeRef = useRef<number | null>(null);
  // Minimum travel distance before determining it's a deliberate pull
  const minPullDistance = 15;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Skip if we're in the process of refreshing
      if (isRefreshing) return;
      
      // Store the initial touch time to determine intent
      initialTouchTimeRef.current = Date.now();
      
      // Store the initial scroll position
      scrollStartPosRef.current = container.scrollTop;
      
      // Only allow pull-to-refresh when at the top of the content
      if (container.scrollTop <= 0) {
        startYRef.current = e.touches[0].clientY;
        isScrollingRef.current = false;
      } else {
        // If not at the top, mark as scrolling
        isScrollingRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Skip if already scrolling, refreshing, or pull-to-refresh is disabled
      if (isScrollingRef.current || isRefreshing || disabled) return;
      
      // Check if we're not at the top
      if (container.scrollTop > 5) {
        // If scrolled down even a bit, assume user wants to scroll, not pull
        isScrollingRef.current = true;
        
        // Reset any pull state
        if (isPulling) {
          setPullDistance(0);
          setIsPulling(false);
          startYRef.current = null;
        }
        return;
      }

      // If we started a pull gesture and still at the top
      if (startYRef.current !== null && container.scrollTop <= 0) {
        currentYRef.current = e.touches[0].clientY;
        const delta = currentYRef.current - startYRef.current;
        
        // Only activate pull-to-refresh if pulling down and moved enough distance
        if (delta > minPullDistance) {
          // Apply more resistance to the pull (makes it harder to pull down)
          const newDistance = Math.min(delta * 0.3, maxPullDistance);
          setPullDistance(newDistance);
          setIsPulling(true);
          
          // Prevent default scrolling behavior only when explicitly pulling down
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = async () => {
      // Skip if not pulling or pull-to-refresh is disabled
      if (!isPulling || disabled) return;
      
      // Check if the pull was intentional by evaluating pull distance and time
      const touchDuration = initialTouchTimeRef.current ? Date.now() - initialTouchTimeRef.current : 0;
      const wasIntentionalPull = pullDistance >= pullDownThreshold && touchDuration > 100;
      
      if (wasIntentionalPull) {
        setIsRefreshing(true);
        setPullDistance(0);
        setIsPulling(false);
        
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      } else {
        // Not an intentional pull, reset
        setPullDistance(0);
        setIsPulling(false);
      }
      
      // Reset all refs
      startYRef.current = null;
      currentYRef.current = null;
      initialTouchTimeRef.current = null;
    };

    // Function to handle regular scrolling without refresh behavior
    const handleScroll = () => {
      // If we're scrolling away from the top, reset the pull state
      if (container.scrollTop > 10 && startYRef.current !== null) {
        startYRef.current = null;
        currentYRef.current = null;
        isScrollingRef.current = true;
        if (isPulling) {
          setPullDistance(0);
          setIsPulling(false);
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    container.addEventListener('touchcancel', handleTouchEnd);
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isPulling, pullDistance, pullDownThreshold, maxPullDistance, onRefresh, isRefreshing, disabled]);

  // If disabled, just render children directly
  if (disabled) {
    return (
      <div className="h-full w-full overflow-auto overscroll-contain" ref={containerRef}>
        {children}
      </div>
    );
  }

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
        className="h-full w-full overflow-y-auto overscroll-contain momentum-scroll"
        style={{
          transition: reducedMotion ? 'none' : 'transform 0.2s ease',
          transform: isPulling ? `translateY(${pullDistance}px)` : 
                    isRefreshing ? 'translateY(60px)' : 'translateY(0px)',
          WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
        }}
      >
        {children}
      </div>
    </div>
  );
};
