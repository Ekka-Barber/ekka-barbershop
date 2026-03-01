import { useViewportWidth } from './useViewport';

export const useIsMobile = (breakpoint = 768) => {
  const width = useViewportWidth();
  return width < breakpoint;
};