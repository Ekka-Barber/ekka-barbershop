import { ChevronRight, Sparkles } from 'lucide-react';
import React, { useState, useEffect } from 'react';
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

const sectionStateKey = 'sidebar-sections-expanded';

const getStoredSections = (): string[] => {
  try {
    const stored = localStorage.getItem(sectionStateKey);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const storeSections = (sections: string[]) => {
  try {
    localStorage.setItem(sectionStateKey, JSON.stringify(sections));
  } catch {
    // Ignore storage errors
  }
};


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
  const [expandedItems, setExpandedItems] = useState<string[]>(() => getStoredSections());
  const [expandedSections, setExpandedSections] = useState<string[]>(() => {
    const stored = getStoredSections();
    const activeSections = navigationConfig
      .filter(section => 
        section.items.some(item => {
          const basePath = item.path.split('?')[0];
          return basePath === location.pathname;
        })
      )
      .map(s => s.id);
    return [...new Set([...stored, ...activeSections])];
  });
  const { prefetch, cancelPrefetch } = usePrefetch({ delay: 100 });

  const currentTab = searchParams.get('tab');
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    storeSections(expandedItems);
  }, [expandedItems]);

  const closeSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isPathActive = (path: string) => {
    const basePath = path.split('?')[0];
    if (basePath !== location.pathname) return false;
    
    const pathTab = new URLSearchParams(path.split('?')[1] || '').get('tab');
    if (pathTab) {
      return currentTab === pathTab;
    }
    return true;
  };

  const getActiveItem = () => {
    return navigationConfig.flatMap((section) => section.items).find(
      (item) => item.path === location.pathname
    );
  };

  const activeItem = getActiveItem();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

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
                'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ml-6',
                isActiveTab
                  ? 'bg-primary text-primary-foreground shadow-soft scale-105'
                  : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground hover:scale-105'
              )}
            >
              {TabIcon && <TabIcon className="h-4 w-4" />}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex flex-col gap-1">
            <p className="font-medium">{tab.label}</p>
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
          'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ml-6 group',
          'hover:translate-x-1',
          isActiveTab
            ? 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
        )}
        onClick={closeSidebar}
        onMouseEnter={() => handlePrefetch(parentPath)}
      >
        <div className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full bg-primary transition-all duration-200',
          isActiveTab ? 'h-6' : 'group-hover:h-4'
        )} />
        {TabIcon && (
          <TabIcon
            className={cn(
              'h-4 w-4 flex-shrink-0 transition-transform duration-200',
              isActiveTab
                ? 'text-primary-foreground'
                : 'text-muted-foreground group-hover:text-sidebar-foreground group-hover:scale-110'
            )}
          />
        )}
        <span className="truncate">{tab.label}</span>
        {tab.badge && (
          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
            {tab.badge}
          </Badge>
        )}
      </Link>
    );
  };

  // Render main navigation item
  const renderNavigationItem = (item: NavigationItem) => {
    const isActive = isPathActive(item.path) || activeItem?.id === item.id;
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
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg scale-105'
                    : 'hover:bg-sidebar-accent text-muted-foreground hover:text-sidebar-foreground hover:scale-105'
                )}
              >
                {ItemIcon && <ItemIcon className="h-5 w-5" />}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="flex flex-col gap-1">
              <p className="font-medium">{item.label}</p>
              {item.description && (
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          {isActive && hasSubTabs && currentTab && (
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <div className="flex items-center group/item">
          <Link
            to={item.path}
            onClick={closeSidebar}
            onMouseEnter={() => handlePrefetch(item.path)}
            onMouseLeave={cancelPrefetch}
            className={cn(
              'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 flex-1 group/link',
              'hover:translate-x-0.5',
              isActive
                ? 'bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
            )}
          >
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-full bg-primary transition-all duration-200',
              isActive ? 'h-8' : 'group-hover/link:h-5'
            )} />
            {ItemIcon && (
              <ItemIcon
                className={cn(
                  'h-5 w-5 flex-shrink-0 transition-transform duration-200',
                  isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground group-hover/link:text-sidebar-foreground group-hover/link:scale-110'
                )}
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="truncate block">{item.label}</span>
              {item.description && !isActive && (
                <span className="text-[10px] text-muted-foreground/70 truncate block">
                  {item.description}
                </span>
              )}
            </div>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-[10px] px-1.5">
                {item.badge}
              </Badge>
            )}
            {isActive && !hasSubTabs && (
              <Sparkles className="h-3.5 w-3.5 ml-auto text-primary-foreground/70" />
            )}
          </Link>

          {hasSubTabs && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                'p-1 h-8 w-8 ml-1 transition-transform duration-200',
                isActive
                  ? 'text-primary-foreground hover:bg-primary/80'
                  : 'text-muted-foreground hover:text-sidebar-foreground',
                isExpanded && 'rotate-90'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {hasSubTabs && isExpanded && (
          <div className="relative space-y-0.5 ml-4 pl-4 border-l-2 border-sidebar-border/50">
            <div className="absolute left-0 top-0 w-2 h-2 rounded-full bg-sidebar-border/50 -translate-x-[5px]" />
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

  return (
    <div className={cn('flex flex-col h-full app-fade-in app-delay-1', className)}>
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigationConfig.map((section) => {
            const isSectionExpanded = expandedSections.includes(section.id) || 
              section.items.some(item => isPathActive(item.path) || activeItem?.id === item.id);
            
            return (
              <div key={section.id} className="space-y-2">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-sidebar-accent/40 transition-colors group"
                  >
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.24em] group-hover:text-sidebar-foreground transition-colors">
                      {section.label}
                    </h3>
                    <ChevronRight 
                      className={cn(
                        'h-3 w-3 text-muted-foreground transition-transform duration-200',
                        isSectionExpanded && 'rotate-90'
                      )} 
                    />
                  </button>
                )}
                <div className={cn(
                  'space-y-1 overflow-hidden transition-all duration-300',
                  isCollapsed || isSectionExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                )}>
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
