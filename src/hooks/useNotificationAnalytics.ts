
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationMessage, NotificationTracking } from "@/types/notifications";

export interface NotificationAnalytics {
  totalSent: number;
  totalClicked: number;
  totalReceived: number;
  activeSubscriptions: number;
  // New analytics metrics
  deliveryRate: number;
  clickThroughRate: number;
  errorRate: number;
  platformBreakdown: Record<string, number>;
}

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
      // Get active subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('id, platform')
        .eq('status', 'active');

      if (subError) throw subError;

      // Get tracking events
      const { data: trackingEvents, error: trackingError } = await supabase
        .from('notification_tracking')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (trackingError) throw trackingError;

      // Calculate platform breakdown
      const platformCounts: Record<string, number> = {};
      subscriptions?.forEach(sub => {
        const platform = sub.platform || 'unknown';
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });

      // Calculate rates
      const sent = trackingEvents?.filter(e => e.event_type === 'notification_sent').length || 0;
      const delivered = trackingEvents?.filter(e => e.event_type === 'received').length || 0;
      const clicked = trackingEvents?.filter(e => e.event_type === 'clicked').length || 0;
      const failed = trackingEvents?.filter(e => e.event_type === 'failed').length || 0;

      setAnalytics({
        totalSent: sent,
        totalClicked: clicked,
        totalReceived: delivered,
        activeSubscriptions: subscriptions?.length || 0,
        deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
        clickThroughRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
        errorRate: sent > 0 ? (failed / sent) * 100 : 0,
        platformBreakdown: platformCounts
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  return { analytics, fetchAnalytics };
};
