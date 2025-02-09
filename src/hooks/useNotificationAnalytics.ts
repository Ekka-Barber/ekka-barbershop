
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationMessage, NotificationTracking } from "@/types/notifications";

export interface NotificationAnalytics {
  totalSent: number;
  totalClicked: number;
  totalReceived: number;
  activeSubscriptions: number;
  deliveryRate: number;
  clickThroughRate: number;
  errorRate: number;
  platformBreakdown: Record<string, number>;
}

const calculateAnalytics = (
  subscriptions: any[],
  trackingEvents: NotificationTracking[]
): NotificationAnalytics => {
  const platformCounts: Record<string, number> = {};
  subscriptions?.forEach(sub => {
    const platform = sub.platform || 'unknown';
    platformCounts[platform] = (platformCounts[platform] || 0) + 1;
  });

  const sent = trackingEvents.filter(e => e.event_type === 'notification_sent').length;
  const delivered = trackingEvents.filter(e => e.event_type === 'received').length;
  const clicked = trackingEvents.filter(e => e.event_type === 'clicked').length;
  const failed = trackingEvents.filter(e => e.event_type === 'failed').length;

  return {
    totalSent: sent,
    totalClicked: clicked,
    totalReceived: delivered,
    activeSubscriptions: subscriptions?.length || 0,
    deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
    clickThroughRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
    errorRate: sent > 0 ? (failed / sent) * 100 : 0,
    platformBreakdown: platformCounts
  };
};

export const useNotificationAnalytics = (messages: NotificationMessage[]) => {
  const [analytics, setAnalytics] = useState<NotificationAnalytics>({
    totalSent: 0,
    totalClicked: 0,
    totalReceived: 0,
    activeSubscriptions: 0,
    deliveryRate: 0,
    clickThroughRate: 0,
    errorRate: 0,
    platformBreakdown: {}
  });

  const fetchAnalytics = async () => {
    try {
      const [subsResponse, trackingResponse] = await Promise.all([
        supabase
          .from('push_subscriptions')
          .select('*')
          .eq('status', 'active'),
        supabase
          .from('notification_tracking')
          .select('*')
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      if (subsResponse.error) throw subsResponse.error;
      if (trackingResponse.error) throw trackingResponse.error;

      setAnalytics(calculateAnalytics(
        subsResponse.data || [],
        trackingResponse.data as NotificationTracking[]
      ));

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  return { analytics, fetchAnalytics };
};
