
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NotificationAnalytics {
  totalSent: number;
  totalClicked: number;
  totalReceived: number;
  activeSubscriptions: number;
}

export const useNotificationAnalytics = (messages: any[]) => {
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

      const { data: events, error: eventsError } = await supabase
        .from('notification_events')
        .select('event_type, action');

      if (eventsError) throw eventsError;

      setAnalytics({
        totalSent: messages.length,
        totalClicked: events?.filter(e => e.event_type === 'clicked').length || 0,
        totalReceived: events?.filter(e => e.event_type === 'received').length || 0,
        activeSubscriptions: subscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  return { analytics, fetchAnalytics };
};
