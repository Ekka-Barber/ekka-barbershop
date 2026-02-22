import { ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';

import { NAVIGATION_CONFIG } from '@shared/constants/navigation';
import { usePrefetch } from '@shared/hooks/usePrefetch';
import { getPreloader } from '@shared/lib/route-preload-registry';
import { cn } from '@shared/lib/utils';
import type {
  NavigationItem,
  NavigationSection,
  NavigationTab,
} from '@shared/types/navigation';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { ScrollArea } from '@shared/ui/components/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@shared/ui/components/tooltip';

import { useSidebar } from './context';


interface EnhancedSidebarProps {
  className?: string;
  navigationConfig?: NavigationSection[];
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  className,
  navigationConfig = NAVIGATION_CONFIG,
}) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const { prefetch, cancelPrefetch } = usePrefetch({ delay: 100 });
  // Navigation hook removed as it's not currently used

  const currentTab = searchParams.get('tab');
  const isCollapsed = state === 'collapsed';

  // Close sidebar when navigating (mobile only - desktop stays open)
  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
    // Desktop sidebar stays open on navigation
  };

  // Debug logging removed for production readiness

  // Determine which item is currently active
  const getActiveItem = () => {
    return navigationConfig.flatMap((section) => section.items).find(
      (item) => item.path === location.pathname
    );
  };

  const activeItem = getActiveItem();

  // Toggle expanded state for navigation items
  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Check if item should be expanded (active item or manually expanded)
  const isItemExpanded = (itemId: string) => {
    return (
      expandedItems.includes(itemId) ||
      (activeItem?.id === itemId && activeItem?.tabs)
    );
  };

  const handlePrefetch = (path: string) => {
    const preloader = getPreloader(path);
    if (preloader) {
      prefetch(preloader, path);
    }
  };

  // Render navigation tab
  const renderTab = (tab: NavigationTab, parentPath: string) => {
    const tabUrl = `${parentPath}?tab=${tab.id}`;
    const isActiveTab =
      currentTab === tab.id || (!currentTab && tab.id === 'overview');
    const TabIcon = tab.icon || (() => null);

    if (isCollapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={tabUrl}
              onClick={closeSidebar}
              onMouseEnter={() => handlePrefetch(parentPath)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-colors ml-6',
                isActiveTab
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground'
              )}
            >
              {TabIcon && <TabIcon className="h-4 w-4" />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{tab.label}</p>
            {tab.description && (
              <p className="text-xs text-muted-foreground">{tab.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        to={tabUrl}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ml-6 group',
          isActiveTab
            ? 'bg-primary text-primary-foreground shadow-soft'
            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/80'
        )}
        onClick={closeSidebar}
        onMouseEnter={() => handlePrefetch(parentPath)}
      >
        {TabIcon && (
          <TabIcon
            className={cn(
              'h-4 w-4 flex-shrink-0',
              isActiveTab
                ? 'text-primary-foreground'
                : 'text-muted-foreground group-hover:text-sidebar-foreground'
            )}
          />
        )}
        <span className="truncate">{tab.label}</span>
        {tab.badge && (
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {tab.badge}
          </Badge>
        )}
      </Link>
    );
  };

  // Render main navigation item
  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = activeItem?.id === item.id;
    const hasSubTabs = item.tabs && item.tabs.length > 0;
    const isExpanded = isItemExpanded(item.id);
    const ItemIcon = item.icon || (() => null);

    if (isCollapsed) {
      return (
        <div className="space-y-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={item.path}
                onClick={closeSidebar}
                onMouseEnter={() => handlePrefetch(item.path)}
                onMouseLeave={cancelPrefetch}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-soft'
                    : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground'
                )}
              >
                {ItemIcon && <ItemIcon className="h-5 w-5" />}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Show active tab indicator when collapsed */}
          {isActive && hasSubTabs && currentTab && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          <Link
            to={item.path}
            onClick={closeSidebar}
            onMouseEnter={() => handlePrefetch(item.path)}
            onMouseLeave={cancelPrefetch}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors flex-1 group',
              isActive
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/80'
            )}
          >
            {ItemIcon && (
              <ItemIcon
                className={cn(
                  'h-5 w-5 flex-shrink-0',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover:text-sidebar-foreground'
                )}
              />
            )}
            <span className="truncate">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-[10px]">
                {item.badge}
              </Badge>
            )}
          </Link>

          {hasSubTabs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                'p-1 h-8 w-8 ml-1',
                isActive
                  ? 'text-primary-foreground hover:bg-primary/80'
                  : 'text-muted-foreground'
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {/* Sub-tabs */}
        {hasSubTabs && isExpanded && (
          <div className="space-y-1 pl-2 border-l-2 border-sidebar-border/70 ml-4">
            {item.tabs!.map((tab) => (
              <React.Fragment key={tab.id}>
                {renderTab(tab, item.path)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  // These handlers are unused and have been removed for production readiness

  return (
    <div className={cn('flex flex-col h-full app-fade-in app-delay-1', className)}>
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigationConfig.map((section) => {
            return (
            <div key={section.id} className="space-y-2">
              {!isCollapsed && (
                <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.32em]">
                  {section.label}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <React.Fragment key={item.id}>
                    {renderNavigationItem(item)}
                  </React.Fragment>
                ))}
              </div>
            </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
