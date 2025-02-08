
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NotificationMessage, NotificationEvent } from "@/types/notifications";

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

      const { data: events, error: eventsError } = await supabase
        .from('notification_events')
        .select('event_type, action') as { data: NotificationEvent[] | null, error: any };

      if (eventsError) throw eventsError;

      const analytics = {
        totalSent: messages.reduce((acc, msg) => acc + (msg.stats?.total_sent || 0), 0),
        totalClicked: events?.filter(e => e.event_type === 'clicked').length || 0,
        totalReceived: events?.filter(e => e.event_type === 'received').length || 0,
        activeSubscriptions: subscriptions?.length || 0
      };

      console.log('Updated analytics:', analytics);
      setAnalytics(analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('analytics-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_events'
        },
        () => {
          console.log('Notification event updated, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'push_subscriptions'
        },
        () => {
          console.log('Subscription updated, refreshing analytics...');
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [messages]);

  return { analytics, fetchAnalytics };
};
