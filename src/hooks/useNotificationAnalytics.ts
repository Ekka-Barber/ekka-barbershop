
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

      const { data: deliveries, error: deliveryError } = await supabase
        .from('notification_deliveries')
        .select('status');

      if (deliveryError) throw deliveryError;

      setAnalytics({
        totalSent: messages.reduce((acc, msg) => acc + (msg.stats?.total_sent || 0), 0),
        totalClicked: deliveries?.filter(d => d.status === 'clicked').length || 0,
        totalReceived: deliveries?.filter(d => d.status === 'delivered').length || 0,
        activeSubscriptions: subscriptions?.length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error("Error loading analytics");
    }
  };

  return { analytics, fetchAnalytics };
};
