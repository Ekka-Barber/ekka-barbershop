import { useCallback, useMemo, useState, useEffect } from 'react';

interface UrlState {
  tab: string;
  branch: string | null;
  date: string;
  page: number;
}

const DEFAULT_STATE: UrlState = {
  tab: 'employee-grid',
  branch: null,
  date: new Date().toISOString().slice(0, 7), // YYYY-MM format
  page: 1
};

const getUrlSearchParams = () => {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
};

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

  // Get current URL state
  const currentState = useMemo(() => {
    const adminAccess = searchParams.get('access');
    const tab = searchParams.get('tab') || DEFAULT_STATE.tab;
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

  // Update URL state while preserving admin access
  const updateUrlState = useCallback((newState: Partial<UrlState>) => {
    const params = new URLSearchParams(window.location.search);
    const adminAccess = params.get('access');

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
  }, []);

  // Sync URL with component state
  const syncUrlWithState = useCallback((
    tab: string,
    branch: string | null,
    date: Date,
    page: number
  ) => {
    const newState: Partial<UrlState> = {
      tab,
      branch,
      date: date.toISOString().slice(0, 7),
      page
    };

    // Only update if values are different from current URL
    const shouldUpdate = Object.entries(newState).some(
      ([key, value]) => currentState[key as keyof UrlState] !== value
    );

    if (shouldUpdate) {
      updateUrlState(newState);
    }
  }, [currentState, updateUrlState]);

  return {
    currentState,
    updateUrlState,
    syncUrlWithState
  };
}; 