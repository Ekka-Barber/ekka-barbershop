import { useEffect, useRef } from 'react';

/**
 * Hook to measure and log component render performance
 * @param componentName Name of the component to monitor
 * @param shouldLog Whether to log the measurements (defaults to true in development)
 * @returns Object with reset function to restart measurements
 */
export const useRenderPerformance = (
  componentName: string,
  shouldLog = process.env.NODE_ENV === 'development'
) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const firstRenderTime = useRef(performance.now());
  const totalRenderTime = useRef(0);
  
  useEffect(() => {
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    
    renderCount.current += 1;
    totalRenderTime.current += renderTime;
    
    if (shouldLog) {
      console.log(`[${componentName}] Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
      console.log(`[${componentName}] Average render time: ${(totalRenderTime.current / renderCount.current).toFixed(2)}ms`);
      console.log(`[${componentName}] Total time since first render: ${(now - firstRenderTime.current).toFixed(2)}ms`);
    }
    
    lastRenderTime.current = now;
    
    return () => {
      // Cleanup
    };
  });
  
  const reset = () => {
    renderCount.current = 0;
    lastRenderTime.current = performance.now();
    firstRenderTime.current = performance.now();
    totalRenderTime.current = 0;
  };
  
  return { reset };
};

/**
 * Hook to measure component interaction response times
 * @param componentName Name of the component to monitor
 * @returns Object with start and end methods to measure interaction times
 */
export const useInteractionTimer = (componentName: string) => {
  const interactionStartTime = useRef<number | null>(null);
  
  const startInteraction = (interactionName: string) => {
    interactionStartTime.current = performance.now();
    return interactionStartTime.current;
  };
  
  const endInteraction = (interactionName: string) => {
    if (interactionStartTime.current === null) {
      console.warn(`[${componentName}] endInteraction called before startInteraction for "${interactionName}"`);
      return 0;
    }
    
    const duration = performance.now() - interactionStartTime.current;
    console.log(`[${componentName}] Interaction "${interactionName}" took ${duration.toFixed(2)}ms`);
    
    interactionStartTime.current = null;
    return duration;
  };
  
  return { startInteraction, endInteraction };
};

/**
 * Utility to measure component load times using the browser's Performance API
 * @param markPrefix Prefix for the performance marks
 * @returns Object with methods to mark start/end and get measurements
 */
export const usePerformanceMeasure = (markPrefix: string) => {
  const isSupported = typeof performance !== 'undefined' && 
                      typeof performance.mark === 'function' &&
                      typeof performance.measure === 'function';
  
  const markStart = (id: string) => {
    if (!isSupported) return;
    const markName = `${markPrefix}-${id}-start`;
    performance.mark(markName);
  };
  
  const markEnd = (id: string) => {
    if (!isSupported) return;
    const startMark = `${markPrefix}-${id}-start`;
    const endMark = `${markPrefix}-${id}-end`;
    const measureName = `${markPrefix}-${id}`;
    
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    const entries = performance.getEntriesByName(measureName);
    return entries.length > 0 ? entries[0].duration : null;
  };
  
  const getLastMeasurement = (id: string) => {
    if (!isSupported) return null;
    const measureName = `${markPrefix}-${id}`;
    const entries = performance.getEntriesByName(measureName);
    return entries.length > 0 ? entries[entries.length - 1].duration : null;
  };
  
  return { markStart, markEnd, getLastMeasurement };
};

/**
 * Hook to monitor memory usage of the application
 * @returns Current memory usage information
 */
export const useMemoryUsage = () => {
  const memoryInfo = useRef<{
    jsHeapSizeLimit?: number;
    totalJSHeapSize?: number;
    usedJSHeapSize?: number;
    timestamp: number;
  }>({
    timestamp: Date.now(),
  });
  
  useEffect(() => {
    const updateMemoryInfo = () => {
      // @ts-expect-error - performance.memory is a non-standard Chrome API
      if (performance && performance.memory) {
        memoryInfo.current = {
          // @ts-expect-error - accessing non-standard properties
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          // @ts-expect-error - accessing non-standard properties
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          // @ts-expect-error - accessing non-standard properties
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          timestamp: Date.now(),
        };
      }
    };
    
    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, 10000); // Update every 10 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);
  
  return memoryInfo.current;
};

/**
 * Factory to create performance monitoring utilities for a component
 * This is not a React hook and should be used at module level
 * @param componentName Name of the component to monitor
 * @returns Object with various performance monitoring methods
 */
export const createPerformanceMonitor = (componentName: string) => {
  // This is not a hook - just a factory function
  return {
    logRender: (renderTime: number) => {
      console.log(`[${componentName}] Render took ${renderTime.toFixed(2)}ms`);
    },
    logInteraction: (interactionName: string, duration: number) => {
      console.log(`[${componentName}] Interaction "${interactionName}" took ${duration.toFixed(2)}ms`);
    },
    logMessage: (message: string) => {
      console.log(`[${componentName}] ${message}`);
    },
    markPerformance: (markName: string) => {
      if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
        performance.mark(`${componentName}-${markName}`);
      }
    }
  };
}; 