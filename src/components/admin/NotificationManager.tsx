
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NotificationComposer } from "./notification/NotificationComposer";
import { NotificationHistory } from "./notification/NotificationHistory";
import { NotificationAnalyticsView } from "./notification/NotificationAnalytics";
import { useNotificationMessages } from "@/hooks/useNotificationMessages";
import { useNotificationAnalytics } from "@/hooks/useNotificationAnalytics";

const NotificationManager = () => {
  const { messages, loading, fetchMessages } = useNotificationMessages();
  const { analytics, fetchAnalytics } = useNotificationAnalytics(messages);

  useEffect(() => {
    fetchMessages();
    fetchAnalytics();
    
    const channel = supabase
      .channel('notification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_events'
        },
        () => {
          fetchMessages();
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Tabs defaultValue="compose" className="space-y-8">
      <TabsList>
        <TabsTrigger value="compose" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Compose
        </TabsTrigger>
        <TabsTrigger value="analytics" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="compose" className="space-y-8">
        <NotificationComposer onMessageSent={fetchMessages} />
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Message History</h2>
          <NotificationHistory 
            messages={messages} 
            loading={loading} 
            onMessageResent={fetchMessages} 
          />
        </div>
      </TabsContent>

      <TabsContent value="analytics">
        <NotificationAnalyticsView analytics={analytics} />
      </TabsContent>
    </Tabs>
  );
};

export default NotificationManager;
