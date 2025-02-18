
export const useNotificationAnalytics = () => {
  return {
    analytics: {
      totalSent: 0,
      totalClicked: 0,
      totalReceived: 0,
      activeSubscriptions: 0,
      deliveryRate: 0,
      clickThroughRate: 0,
      errorRate: 0,
      platformBreakdown: {}
    },
    fetchAnalytics: () => Promise.resolve()
  };
};
