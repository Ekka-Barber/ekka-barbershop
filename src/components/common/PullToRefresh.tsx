
import React, { useMemo } from 'react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { RefreshIndicator } from './pull-to-refresh/RefreshIndicator';
import { getPlatformPullSettings, PlatformPullSettings } from '@/utils/platformUtils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  pullDownThreshold?: number;
  maxPullDownDistance?: number;
  backgroundColor?: string;
  pullingContent?: React.ReactNode;
  refreshingContent?: React.ReactNode;
  disabled?: boolean;
  pullResistance?: number;
  autoDisableOnPlatforms?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  pullDownThreshold = 80,
  maxPullDownDistance = 120,
  backgroundColor = 'white',
  pullingContent,
  refreshingContent,
  disabled: userDisabled = false,
  pullResistance,
  autoDisableOnPlatforms = true,
}) => {
  // Get platform-specific settings
  const platformSettings: PlatformPullSettings = useMemo(() => 
    autoDisableOnPlatforms ? getPlatformPullSettings() : {}, 
  [autoDisableOnPlatforms]);

  // Combine user settings with platform defaults
  const finalPullResistance = pullResistance ?? platformSettings.pullResistance ?? 0.3;
  const finalDisabled = userDisabled || (platformSettings.disabled ?? false);
  const finalTopScrollThreshold = platformSettings.topScrollThreshold ?? 1;

  const {
    containerRef,
    isPulling,
    isRefreshing,
    pullDistance,
    reducedMotion
  } = usePullToRefresh({
    onRefresh,
    pullDownThreshold,
    maxPullDownDistance,
    disabled: finalDisabled,
    topScrollThreshold: finalTopScrollThreshold,
    pullResistance: finalPullResistance
  });

  // If disabled, just render children directly
  if (finalDisabled) {
    return (
      <div className="h-full w-full overflow-auto overscroll-contain" ref={containerRef}>
        {children}
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-hidden" style={{ position: 'relative', backgroundColor }}>
      <RefreshIndicator
        isPulling={isPulling}
        isRefreshing={isRefreshing}
        pullDistance={pullDistance}
        pullDownThreshold={pullDownThreshold}
        pullingContent={pullingContent}
        refreshingContent={refreshingContent}
      />
      
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
