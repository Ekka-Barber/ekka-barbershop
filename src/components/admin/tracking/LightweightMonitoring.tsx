
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedEvent } from "./types";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export const LightweightMonitoring = () => {
  const [realtimeEvents, setRealtimeEvents] = useState<UnifiedEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch initial active sessions
    const fetchActiveSessions = async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('tracking_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('last_activity', thirtyMinutesAgo);

      setActiveSessions(count || 0);
      setIsLoading(false);
    };

    fetchActiveSessions();

    // Subscribe to realtime events
    const channel = supabase
      .channel('public:unified_events')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'unified_events' },
        (payload) => {
          const newEvent = payload.new as UnifiedEvent;
          setRealtimeEvents(prev => [newEvent, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'page_view': return 'bg-blue-500';
      case 'interaction': return 'bg-green-500';
      case 'business': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSessions}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realtimeEvents.map((event, index) => (
              <div key={event.id || index} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                <div>
                  <Badge className={getEventBadgeColor(event.event_type)}>
                    {event.event_type}
                  </Badge>
                  <span className="ml-2 text-sm">{event.event_name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {realtimeEvents.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No events yet. Events will appear here in real-time.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
