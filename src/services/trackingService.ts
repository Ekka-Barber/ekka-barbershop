
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

const initializeTracking = async (): Promise<void> => {
  // Don't initialize tracking in preview environments
  if (window.location.hostname.includes('preview--')) {
    console.log('Tracking disabled in preview environment');
    return;
  }

  if (!shouldTrack()) return;
  
  try {
    await trackPageView(window.location.pathname);
    
    // Track initial marketing funnel stage
    await trackMarketingFunnel({
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
  } catch (error) {
    console.error('Error initializing tracking:', error);
  }
};

const cleanupTracking = (): void => {
  if (!shouldTrack()) return;
  // Add any cleanup logic here if needed
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
