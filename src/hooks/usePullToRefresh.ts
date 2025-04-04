
import { useState, useRef, useEffect } from 'react';
import { prefersReducedMotion } from '@/services/platformDetection';

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  disabled?: boolean;
  topScrollThreshold?: number;
  minPullDistance?: number;
  pullResistance?: number;
}

export const usePullToRefresh = ({
  onRefresh,
  pullDownThreshold = 80,
  maxPullDownDistance = 120, 
  disabled = false,
  topScrollThreshold = 1,
  minPullDistance = 15,
  pullResistance = 0.3
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startYRef = useRef<number | null>(null);
  const currentYRef = useRef<number | null>(null);
  const isScrollingRef = useRef(false);
  const initialTouchTimeRef = useRef<number | null>(null);
  const reducedMotion = prefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    // Skip if we're in the process of refreshing or disabled
    if (isRefreshing || disabled) return;
    
    // Store the initial touch time to determine intent
    initialTouchTimeRef.current = Date.now();
    
    // Store the initial scroll position
    const container = containerRef.current;
    if (!container) return;
    
    const scrollTop = Math.max(0, container.scrollTop);
    
    // Only allow pull-to-refresh when exactly at the top of the content
    // Using a strict threshold to ensure we're really at the top
    if (scrollTop <= topScrollThreshold) {
      startYRef.current = e.touches[0].clientY;
      isScrollingRef.current = false;
    } else {
      // If not at the top, mark as scrolling
      isScrollingRef.current = true;
      
      // Reset any pull state that might be lingering
      if (isPulling) {
        setPullDistance(0);
        setIsPulling(false);
      }
    }
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    // Skip if already scrolling, refreshing, or pull-to-refresh is disabled
    if (isScrollingRef.current || isRefreshing || disabled) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const scrollTop = Math.max(0, container.scrollTop);
    
    // Only continue with pull gesture if we're exactly at the top
    if (scrollTop > topScrollThreshold) {
      // If even slightly scrolled down, treat as regular scroll
      isScrollingRef.current = true;
      
      // Reset any pull state
      if (isPulling) {
        setPullDistance(0);
        setIsPulling(false);
        startYRef.current = null;
      }
      return;
    }

    // If we started a pull gesture and are still at the top
    if (startYRef.current !== null && scrollTop <= topScrollThreshold) {
      currentYRef.current = e.touches[0].clientY;
      const delta = currentYRef.current - startYRef.current;
      
      // Only activate pull-to-refresh if pulling down and moved enough distance
      if (delta > minPullDistance) {
        // Apply resistance to the pull (makes it harder to pull down)
        const newDistance = Math.min(delta * pullResistance, maxPullDownDistance);
        setPullDistance(newDistance);
        setIsPulling(true);
        
        // Prevent default scrolling behavior only when explicitly pulling down
        e.preventDefault();
      }
    }
  };

  // Handle touch end
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
    isScrollingRef.current = false;
  };

  // Handle scroll
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    
    // If we're scrolling away from the top, reset the pull state
    if (container.scrollTop > topScrollThreshold && startYRef.current !== null) {
      startYRef.current = null;
      currentYRef.current = null;
      isScrollingRef.current = true;
      if (isPulling) {
        setPullDistance(0);
        setIsPulling(false);
      }
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

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
  }, [isPulling, pullDistance, isRefreshing, disabled, pullDownThreshold, maxPullDownDistance]);

  return {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    pullDownThreshold,
    reducedMotion
  };
};
