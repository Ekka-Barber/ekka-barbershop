
// Empty tracking hook to maintain interface while tracking is disabled
export const useBookingTracking = () => {
  return {
    trackStep: () => {},
    trackInteraction: () => {},
  };
};
