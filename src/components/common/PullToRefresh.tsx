import React, { useRef, useState, ReactNode } from 'react';
import { RefreshIndicator } from './pull-to-refresh/RefreshIndicator';
import { getPlatformPullSettings, PlatformPullSettings } from '@/utils/platformUtils';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  refreshIndicatorColor?: string;
  backgroundColor?: string;
  autoDisableOnPlatforms?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  pullDownThreshold = 100,
  maxPullDownDistance = 150,
  refreshIndicatorColor = '#000',
  backgroundColor = 'transparent',
  autoDisableOnPlatforms = true,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const initialScrollTop = useRef<number | null>(null);
  
  const platformSettings: PlatformPullSettings = getPlatformPullSettings();
  const pullResistance = platformSettings.pullResistance || 0.3;
  const isDisabled = autoDisableOnPlatforms && (platformSettings.disabled || false);
  const topScrollThreshold = platformSettings.topScrollThreshold || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setIsPulling(false);
      setPullDistance(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDisabled) return;
    
    const currentScrollTop = contentRef.current ? contentRef.current.scrollTop : 0;
    if (currentScrollTop <= topScrollThreshold) {
      touchStartY.current = e.touches[0].clientY;
      initialScrollTop.current = currentScrollTop;
    } else {
      touchStartY.current = null;
      initialScrollTop.current = null;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDisabled || touchStartY.current === null) return;

    const touchMoveY = e.touches[0].clientY;
    const distance = Math.max(0, touchMoveY - touchStartY.current);
    const resistedDistance = Math.min(maxPullDownDistance, distance * pullResistance);

    if (distance > 0 && initialScrollTop.current === 0) {
      e.preventDefault();
      setIsPulling(true);
      setPullDistance(resistedDistance);
    }
  };

  const handleTouchEnd = () => {
    if (isDisabled || !isPulling) return;

    setIsPulling(false);
    if (pullDistance >= pullDownThreshold) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
    touchStartY.current = null;
    initialScrollTop.current = null;
  };
  
  return (
    <div className="pull-to-refresh-container" style={{ position: 'relative', height: '100%' }}>
      {isPulling && (
        <RefreshIndicator 
          pullDistance={pullDistance} 
          pullDownThreshold={pullDownThreshold} 
          isRefreshing={isRefreshing}
          color={refreshIndicatorColor}
          backgroundColor={backgroundColor}
        />
      )}
      <div 
        ref={contentRef}
        className="pull-to-refresh-content"
        style={{ 
          height: '100%', 
          width: '100%',
          overflow: 'auto',
          transform: isPulling ? `translateY(${pullDistance}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.2s ease-out'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
};
