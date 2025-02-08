
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationMessage, NotificationTracking } from "@/types/notifications";

export interface NotificationAnalytics {
  totalSent: number;
  totalClicked: number;
  totalReceived: number;
  activeSubscriptions: number;
}

export const useNotificationAnalytics = (messages: NotificationMessage[]) => {
  const [analytics, setAnalytics] = useState<NotificationAnalytics>({
    totalSent: 0,
    totalClicked: 0,
    totalReceived: 0,
    activeSubscriptions: 0
  });

  const fetchAnalytics = async () => {
    try {
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('status', 'active');

      if (subError) throw subError;

      const { data: tracking, error: trackingError } = await supabase
        .from('notification_tracking')
        .select('event_type, action') as { data: NotificationTracking[] | null, error: any };

      if (trackingError) throw trackingError;

      setAnalytics({
        totalSent: messages.reduce((acc, msg) => acc + (msg.stats?.total_sent || 0), 0),
        totalClicked: tracking?.filter(e => e.event_type === 'clicked').length || 0,
        totalReceived: tracking?.filter(e => e.event_type === 'received').length || 0,
        activeSubscriptions: subscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  return { analytics, fetchAnalytics };
};
