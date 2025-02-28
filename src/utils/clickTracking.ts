
/**
 * Tracks page views for analytics
 */
export const trackPageView = (data: {
  page: string;
  source?: string;
  branch?: string | null;
}) => {
  console.log('Page view tracked:', data);
  // Implementation commented out to prevent errors
  // This would typically send analytics data to a tracking service
};
