
import { 
  trackPageView,
  trackInteraction 
} from './tracking/pageTracking';
import { trackServiceInteraction } from './tracking/serviceTracking';
import { trackDateTimeInteraction } from './tracking/dateTimeTracking';
import { trackBarberInteraction } from './tracking/barberTracking';
import { trackOfferInteraction } from './tracking/offerTracking';
import { trackMarketingFunnel } from './tracking/marketingTracking';
import { trackBranchSelection } from './tracking/branchTracking';
import { shouldTrack } from './tracking/sessionManager';

const initializeTracking = (): void => {
  if (!shouldTrack()) return;
  
  trackPageView(window.location.pathname);
  
  // Track initial marketing funnel stage
  trackMarketingFunnel({
    funnel_stage: 'landing',
    time_in_stage: 0,
    conversion_successful: false,
    drop_off_point: false,
    entry_point: window.location.pathname,
    interaction_path: {
      path: [window.location.pathname],
      timestamps: [Date.now()]
    }
  });
};

const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
};

export {
  trackPageView,
  trackInteraction,
  trackServiceInteraction,
  trackDateTimeInteraction,
  trackBarberInteraction,
  trackOfferInteraction,
  trackMarketingFunnel,
  trackBranchSelection,
  initializeTracking,
  cleanupTracking
};
