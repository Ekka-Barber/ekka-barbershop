import { useState, useCallback } from 'react';
import { usePDFFetch, PDFFile } from './usePDFFetch';

export interface MarketingDialogState {
  open: boolean;
  contentType: 'menu' | 'offers';
  content: PDFFile[];
  currentIndex: number;
}

export const useMarketingDialog = () => {
  const [dialogState, setDialogState] = useState<MarketingDialogState>({
    open: false,
    contentType: 'menu',
    content: [],
    currentIndex: 0
  });

  // Fetch content when opening dialog
  const { pdfFiles: menuFiles, isLoading: menuLoading } = usePDFFetch('menu');
  const { pdfFiles: offersFiles, isLoading: offersLoading } = usePDFFetch('offers', true);

  const openMarketingDialog = useCallback((
    contentType: 'menu' | 'offers',
    initialIndex: number = 0
  ) => {
    const content = contentType === 'menu' ? menuFiles : offersFiles;

    setDialogState({
      open: true,
      contentType,
      content,
      currentIndex: Math.min(initialIndex, content.length - 1)
    });
  }, [menuFiles, offersFiles]);

  const closeMarketingDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      open: false
    }));
  }, []);

  const updateDialogContent = useCallback((content: PDFFile[], currentIndex: number = 0) => {
    setDialogState(prev => ({
      ...prev,
      content,
      currentIndex: Math.min(currentIndex, content.length - 1)
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
    updateDialogContent,

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
