
import { useState, useEffect } from 'react';
import { hasNotch, isRunningAsStandalone, getSafeAreaInsets, getViewportDimensions } from "@/services/platformDetection";

export const useLayoutSetup = () => {
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);
  const [safeAreaInsets, setSafeAreaInsets] = useState({ top: 0, bottom: 0 });
  const isStandalone = isRunningAsStandalone();
  const deviceHasNotch = hasNotch();

  useEffect(() => {
    const handleResize = () => {
      const { height } = getViewportDimensions();
      setViewportHeight(height);
      
      const insets = getSafeAreaInsets();
      setSafeAreaInsets({
        top: parseInt(insets.top || '0', 10),
        bottom: parseInt(insets.bottom || '0', 10)
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    const timeoutIds = [
      setTimeout(handleResize, 100),
      setTimeout(handleResize, 500),
      setTimeout(handleResize, 1000)
    ];

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [deviceHasNotch, isStandalone]);

  return {
    viewportHeight,
    safeAreaInsets,
    isStandalone,
    deviceHasNotch
  };
};
