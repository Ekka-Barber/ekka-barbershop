
import React from 'react';
import { ArrowDownUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface RefreshIndicatorProps {
  isPulling?: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullDownThreshold?: number;
  pullingContent?: React.ReactNode;
  refreshingContent?: React.ReactNode;
  color?: string;
  backgroundColor?: string;
}

export const RefreshIndicator: React.FC<RefreshIndicatorProps> = ({
  isPulling = true,
  isRefreshing,
  pullDistance,
  pullDownThreshold = 100,
  pullingContent,
  refreshingContent,
  color = '#000',
  backgroundColor = 'transparent'
}) => {
  const { t } = useLanguage();
  // Default pulling content
  const defaultPullingContent = (
    <div className="flex items-center justify-center text-gray-500">
      <ArrowDownUp className={`mr-2 ${pullDistance >= pullDownThreshold ? 'text-green-500' : ''}`} style={{ color: pullDistance >= pullDownThreshold ? 'green' : color }} />
      <span>{pullDistance >= pullDownThreshold ? t('release.refresh') : t('pull.down.refresh')}</span>
    </div>
  );

  // Default refreshing content
  const defaultRefreshingContent = (
    <div className="flex items-center justify-center text-gray-500">
      <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-primary rounded-full mr-2" style={{ borderColor: color }} />
      <span>{t('refreshing')}</span>
    </div>
  );

  if (!isPulling && !isRefreshing) return null;

  return (
    <div
      className="absolute w-full flex items-center justify-center z-10 pointer-events-none overflow-hidden transition-all duration-200"
      style={{ 
        height: isPulling ? `${pullDistance}px` : isRefreshing ? '60px' : '0px',
        top: 0,
        backgroundColor
      }}
    >
      {isPulling ? 
        (pullingContent || defaultPullingContent) : 
        (refreshingContent || defaultRefreshingContent)}
    </div>
  );
};
