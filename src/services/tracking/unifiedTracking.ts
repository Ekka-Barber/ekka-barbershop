
import { supabase } from "@/integrations/supabase/client";
import { 
  UnifiedEvent, 
  TrackingSession, 
  ServiceInteractionEvent,
  BarberInteractionEvent,
  DateTimeInteractionEvent,
  OfferInteractionEvent,
  MenuInteractionEvent,
  BranchSelectionEvent,
  MarketingFunnelEvent
} from './types/unified';
import { getSessionId, shouldTrack } from './sessionManager';
import { getPlatformType } from '@/services/platformDetection';
import { mapPlatformToDeviceType, formatTimestamp } from './utils';

class UnifiedTrackingService {
  private async trackEvent(event: UnifiedEvent) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase.from('unified_events').insert({
        ...event,
        session_id: event.session_id || getSessionId(),
        device_type: event.device_type || mapPlatformToDeviceType(getPlatformType()),
        page_url: event.page_url || window.location.pathname,
        timestamp: event.timestamp || formatTimestamp(new Date()),
        created_at: formatTimestamp(new Date())
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking unified event:', error);
    }
  }

  async trackPageView(url: string, additionalData: Record<string, any> = {}) {
    await this.trackEvent({
      event_type: 'page_view',
      event_name: 'page_view',
      page_url: url,
      event_data: {
        ...additionalData,
        referrer: document.referrer,
        title: document.title
      }
    });
  }

  async trackInteraction(type: string, details: Record<string, any> = {}) {
    await this.trackEvent({
      event_type: 'interaction',
      event_name: type,
      event_data: details
    });
  }

  async trackServiceInteraction(event: Omit<ServiceInteractionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'business',
      event_name: 'service_interaction'
    });
  }

  async trackBarberInteraction(event: Omit<BarberInteractionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'business',
      event_name: 'barber_interaction'
    });
  }

  async trackDateTimeInteraction(event: Omit<DateTimeInteractionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'business',
      event_name: 'datetime_interaction'
    });
  }

  async trackOfferInteraction(event: Omit<OfferInteractionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'marketing',
      event_name: 'offer_interaction'
    });
  }

  async trackMenuInteraction(event: Omit<MenuInteractionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'interaction',
      event_name: 'menu_interaction'
    });
  }

  async trackBranchSelection(event: Omit<BranchSelectionEvent, 'event_type'>) {
    await this.trackEvent({
      ...event,
      event_type: 'interaction',
      event_name: 'branch_selection'
    });
  }

  async trackMarketingFunnel(event: MarketingFunnelEvent) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase.from('marketing_funnel_events').insert({
        ...event,
        created_at: formatTimestamp(new Date())
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking marketing funnel:', error);
    }
  }

  async updateSession(sessionData: Partial<TrackingSession>) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase
        .from('tracking_sessions')
        .update({
          ...sessionData,
          last_activity: formatTimestamp(new Date())
        })
        .eq('id', getSessionId());

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }
}

export const unifiedTracking = new UnifiedTrackingService();
