import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

interface UseTabNavigationOptions {
  defaultTab: string;
  paramName?: string;
}

export const useTabNavigation = ({
  defaultTab,
  paramName = 'tab',
}: UseTabNavigationOptions) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [internalTab, setInternalTab] = useState<string>(defaultTab);

  // Get the current tab from URL params or use default
  const urlTab = searchParams.get(paramName);
  const currentTab = urlTab || defaultTab;

  // Sync internal state with URL changes
  useEffect(() => {
    const newTab = urlTab || defaultTab;
    if (newTab !== internalTab) {
      setInternalTab(newTab);
    }
  }, [urlTab, defaultTab, internalTab]);

  // Also trigger on location changes
  useEffect(() => {
    const currentUrlTab = searchParams.get(paramName);
    const newTab = currentUrlTab || defaultTab;
    setInternalTab(newTab);
  }, [location.pathname, searchParams, paramName, defaultTab]);

  // Debug logging removed for production readiness

  const setActiveTab = (tabValue: string) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (tabValue === defaultTab) {
      // Remove the tab param if it's the default to clean up URL
      newSearchParams.delete(paramName);
    } else {
      newSearchParams.set(paramName, tabValue);
    }

    // Update URL without triggering navigation
    setSearchParams(newSearchParams, { replace: true });
  };

  // Navigate to a specific tab programmatically
  const navigateToTab = (tabValue: string, replace: boolean = false) => {
    const newSearchParams = new URLSearchParams(searchParams);

    if (tabValue === defaultTab) {
      newSearchParams.delete(paramName);
    } else {
      newSearchParams.set(paramName, tabValue);
    }

    const newUrl = `${location.pathname}?${newSearchParams.toString()}`;
    navigate(newUrl, { replace });
  };

  return {
    currentTab,
    setActiveTab,
    navigateToTab,
  };
};
