import { useIsMobile as useIsMobileViewport } from './useViewport';

export const useIsMobile = (breakpoint = 768) => {
  return useIsMobileViewport(breakpoint);
};