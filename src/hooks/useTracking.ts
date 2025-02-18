
// Minimal no-op implementation to maintain API compatibility
export const useTracking = () => {
  return {
    trackInteraction: () => Promise.resolve(),
    trackBranchSelection: () => Promise.resolve(),
    trackServiceInteraction: () => Promise.resolve(),
  };
};
