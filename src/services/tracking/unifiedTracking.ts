
import { supabase } from "@/integrations/supabase/client";
import { UnifiedEvent, TrackingSession, FunnelStage } from './types/unified';
import { getSessionId, shouldTrack } from './sessionManager';
import { getPlatformType } from '@/services/platformDetection';
import { mapPlatformToDeviceType } from './utils';

class UnifiedTrackingService {
  private async trackEvent(event: UnifiedEvent) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase.from('unified_events').insert({
        ...event,
        session_id: event.session_id || getSessionId(),
        device_type: event.device_type || mapPlatformToDeviceType(getPlatformType()),
        page_url: event.page_url || window.location.pathname,
        created_at: new Date().toISOString()
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

  async trackBusinessEvent(name: string, data: Record<string, any>) {
    await this.trackEvent({
      event_type: 'business',
      event_name: name,
      event_data: data
    });
  }

  async trackFunnelStage(stage: FunnelStage) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase.from('funnel_stages').insert({
        ...stage,
        entry_time: stage.entry_time.toISOString(),
        exit_time: stage.exit_time?.toISOString()
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking funnel stage:', error);
    }
  }

  async updateSession(sessionData: Partial<TrackingSession>) {
    if (!shouldTrack()) return;

    try {
      const { error } = await supabase
        .from('tracking_sessions')
        .update({
          ...sessionData,
          last_activity: new Date().toISOString()
        })
        .eq('id', getSessionId());

      if (error) throw error;
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }
}

export const unifiedTracking = new UnifiedTrackingService();
