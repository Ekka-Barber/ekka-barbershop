import { useCallback, useMemo, useState, useEffect } from 'react';

/**
 * Defines the valid tabs and their configuration
 */
export type TabType = 
  | 'employee-grid' 
  | 'employees' 
  | 'monthly-sales' 
  | 'analytics' 
  | 'schedule' 
  | 'salary' 
  | 'leave';

/**
 * Configuration for URL state parameters by tab
 */
interface TabConfig {
  usesDate?: boolean;
  usesBranch?: boolean;
  usesPagination?: boolean;
}

/**
 * Configuration map for tab-specific URL parameters
 */
const TAB_CONFIG: Record<TabType, TabConfig> = {
  'employee-grid': { usesBranch: true, usesPagination: true },
  'employees': { usesBranch: true, usesPagination: true },
  'monthly-sales': { usesDate: true, usesBranch: true },
  'analytics': { usesDate: true, usesBranch: true },
  'schedule': { usesBranch: true },
  'salary': { usesDate: true },
  'leave': { usesBranch: true }
};

/**
 * Valid tabs list derived from TabType
 */
const VALID_TABS: TabType[] = [
  'employee-grid',  // Original tab (keeping for backward compatibility)
  'employees',      // New employee information tab
  'monthly-sales',  // New monthly sales tab
  'analytics',
  'schedule',
  'salary',
  'leave'
];

/**
 * URL state interface with typed tab property
 */
interface UrlState {
  tab: TabType;
  branch: string | null;
  date: string;
  page: number;
}

/**
 * Default URL state values
 */
const DEFAULT_STATE: UrlState = {
  tab: 'employee-grid',
  branch: null,
  date: new Date().toISOString().slice(0, 7), // YYYY-MM format
  page: 1
};

/**
 * Get URL search parameters from the current window location
 */
const getUrlSearchParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

/**
 * Check if a string is a valid tab
 */
const isValidTab = (tab: string): tab is TabType => {
  return VALID_TABS.includes(tab as TabType);
};

/**
 * Hook to manage URL state synchronization
 */
export const useUrlState = () => {
  const [searchParams, setSearchParams] = useState(getUrlSearchParams);

  // Update searchParams when URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      setSearchParams(getUrlSearchParams());
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Get current URL state with validation
  const currentState = useMemo(() => {
    const adminAccess = searchParams.get('access');
    
    // Get the tab parameter and validate it
    const rawTab = searchParams.get('tab') || DEFAULT_STATE.tab;
    const tab = isValidTab(rawTab) ? rawTab : DEFAULT_STATE.tab;
    
    const branch = searchParams.get('branch');
    const date = searchParams.get('date') || DEFAULT_STATE.date;
    const page = parseInt(searchParams.get('page') || '1', 10);

    return {
      adminAccess,
      tab,
      branch,
      date,
      page
    };
  }, [searchParams]);

  /**
   * Update URL state while preserving admin access and applying tab-specific rules
   */
  const updateUrlState = useCallback((newState: Partial<UrlState>) => {
    const params = new URLSearchParams(window.location.search);
    const adminAccess = params.get('access');

    // Validate tab if provided
    if (newState.tab && !isValidTab(newState.tab)) {
      newState.tab = DEFAULT_STATE.tab;
    }

    // Get current tab or new tab if specified
    const currentTab = (newState.tab || currentState.tab) as TabType;
    const tabConfig = TAB_CONFIG[currentTab];
    
    // Apply tab configuration to remove unneeded parameters
    if (!tabConfig.usesBranch) {
      params.delete('branch');
      delete newState.branch;
    }
    
    if (!tabConfig.usesDate) {
      params.delete('date');
      delete newState.date;
    }
    
    if (!tabConfig.usesPagination) {
      params.delete('page');
      delete newState.page;
    }

    // Update only the provided parameters
    Object.entries(newState).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Always preserve admin access
    if (adminAccess) {
      params.set('access', adminAccess);
    }

    // Update URL without full page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
    setSearchParams(params);
  }, [currentState.tab]);

  /**
   * Sync URL with component state based on the current tab
   */
  const syncUrlWithState = useCallback((
    tab: string,
    branch: string | null,
    date: Date,
    page: number
  ) => {
    // Validate the tab
    const validTab = isValidTab(tab) ? tab : DEFAULT_STATE.tab;
    
    // Get tab configuration
    const tabConfig = TAB_CONFIG[validTab];
    
    // Build state object based on tab configuration
    const newState: Partial<UrlState> = {
      tab: validTab
    };
    
    // Only include parameters that are relevant to the current tab
    if (tabConfig.usesBranch) {
      newState.branch = branch;
    }
    
    if (tabConfig.usesDate) {
      newState.date = date.toISOString().slice(0, 7);
    }
    
    if (tabConfig.usesPagination) {
      newState.page = page;
    }

    // Only update if values are different from current URL
    const shouldUpdate = Object.entries(newState).some(
      ([key, value]) => {
        if (key === 'date' && tabConfig.usesDate) {
          // Special handling for date comparison
          return currentState.date !== value;
        }
        return currentState[key as keyof typeof currentState] !== value;
      }
    );

    if (shouldUpdate) {
      updateUrlState(newState);
    }
  }, [currentState, updateUrlState]);

  /**
   * Get tab-specific configuration
   */
  const getTabConfig = useCallback((tab: TabType): TabConfig => {
    return TAB_CONFIG[tab];
  }, []);

  return {
    currentState,
    updateUrlState,
    syncUrlWithState,
    getTabConfig,
    VALID_TABS
  };
}; 