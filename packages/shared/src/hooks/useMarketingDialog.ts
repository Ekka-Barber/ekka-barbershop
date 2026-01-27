import { useState, useCallback } from 'react';

import { usePDFFetch } from './usePDFFetch';

import { useLanguage } from '@/contexts/LanguageContext';

export interface MarketingDialogState {
  open: boolean;
  contentType: 'menu' | 'offers';
  currentIndex: number;
}

export const useMarketingDialog = () => {
  const { language } = useLanguage();
  const [dialogState, setDialogState] = useState<MarketingDialogState>({
    open: false,
    contentType: 'menu',
    currentIndex: 0
  });
  const [menuEnabled, setMenuEnabled] = useState(false);
  const [offersEnabled, setOffersEnabled] = useState(false);

  // Fetch content when opening dialog
  const { pdfFiles: menuFiles, isLoading: menuLoading } = usePDFFetch('menu', {
    enabled: menuEnabled,
    language
  });
  const { pdfFiles: offersFiles, isLoading: offersLoading } = usePDFFetch('offers', {
    includeBranchInfo: true,
    enabled: offersEnabled,
    language
  });

  const openMarketingDialog = useCallback((
    contentType: 'menu' | 'offers',
    initialIndex: number = 0
  ) => {
    if (contentType === 'menu') {
      setMenuEnabled(true);
    } else {
      setOffersEnabled(true);
    }

    const content = contentType === 'menu' ? menuFiles : offersFiles;
    const hasContent = content.length > 0;
    const safeIndex = hasContent ? Math.min(initialIndex, content.length - 1) : 0;

    setDialogState({
      open: true,
      contentType,
      currentIndex: safeIndex
    });
  }, [menuFiles, offersFiles]);

  const closeMarketingDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  // Helper function to open menu dialog
  const openMenuDialog = useCallback((initialIndex: number = 0) => {
    openMarketingDialog('menu', initialIndex);
  }, [openMarketingDialog]);

  // Helper function to open offers dialog
  const openOffersDialog = useCallback((initialIndex: number = 0) => {
    openMarketingDialog('offers', initialIndex);
  }, [openMarketingDialog]);

  return {
    // Dialog state
    dialogState,

    // Actions
    openMarketingDialog,
    openMenuDialog,
    openOffersDialog,
    closeMarketingDialog,

    // Loading states
    menuLoading,
    offersLoading,

    // Content availability
    hasMenuContent: menuFiles.length > 0,
    hasOffersContent: offersFiles.length > 0,

    // Raw content (for external use)
    menuContent: menuFiles,
    offersContent: offersFiles
  };
};
