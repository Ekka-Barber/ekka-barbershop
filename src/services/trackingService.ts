
import { shouldTrack, cleanupSession } from './tracking/sessionManager';
import { trackPageView } from './tracking/pageTracking';
import { trackInteraction } from './tracking/interactionTracking';
import { trackDateTimeInteraction } from './tracking/dateTimeTracking';
import { trackMarketingFunnel } from './tracking/marketingTracking';
import { trackBarberInteraction } from './tracking/staffTracking';
import { trackServiceInteraction } from './tracking/serviceTracking';
import { trackOfferInteraction } from './tracking/offerTracking';
import { trackBranchSelection } from './tracking/locationTracking';

export {
  trackPageView,
  trackInteraction,
  trackDateTimeInteraction,
  trackMarketingFunnel,
  trackBarberInteraction,
  trackServiceInteraction,
  trackOfferInteraction,
  trackBranchSelection
};

export const initializeTracking = async (): Promise<void> => {
  if (!shouldTrack()) return;
  
  try {
    await trackPageView(window.location.pathname);
    await trackMarketingFunnel({
      funnel_stage: 'landing',
      interaction_type: 'marketing_funnel',
      time_in_stage: 0,
      conversion_successful: false,
      drop_off_point: false,
      entry_point: window.location.pathname,
      interaction_path: {
        path: [window.location.pathname],
        timestamps: [Date.now()]
      }
    });
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
};

export const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
  cleanupSession();
};
