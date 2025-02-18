
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Clock, BookMarked, Route } from "lucide-react";

interface ActiveSession {
  id: string;
  current_page: string;
  device_type: string;
  last_activity: string;
}

interface RealTimeStats {
  activeSessions: number;
  currentBookingAttempts: number;
  recentInteractions: number;
}

export const RealTimeMonitoring = () => {
  const [stats, setStats] = useState<RealTimeStats>({
    activeSessions: 0,
    currentBookingAttempts: 0,
    recentInteractions: 0
  });
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);

  useEffect(() => {
    // Subscribe to real-time page views
    const channel = supabase
      .channel('real-time-tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_views' },
        (payload) => {
          setStats(prev => ({
            ...prev,
            activeSessions: prev.activeSessions + 1,
            recentInteractions: prev.recentInteractions + 1
          }));
          const newSession = {
            id: payload.new.session_id,
            current_page: payload.new.page_url,
            device_type: payload.new.device_type,
            last_activity: new Date().toISOString()
          };
          setActiveSessions(prev => [...prev, newSession]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'interaction_events' },
        () => {
          setStats(prev => ({
            ...prev,
            recentInteractions: prev.recentInteractions + 1
          }));
        }
      )
      .subscribe();

    // Cleanup old sessions every minute
    const cleanup = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      setActiveSessions(prev => 
        prev.filter(session => session.last_activity > fiveMinutesAgo)
      );
      setStats(prev => ({
        ...prev,
        activeSessions: activeSessions.length
      }));
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(cleanup);
    };
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Real-Time Monitoring</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Booking Attempts</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentBookingAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentInteractions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Paths</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(activeSessions.map(s => s.current_page)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeSessions.map(session => (
              <div key={session.id} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Session: {session.id.slice(0, 8)}...</p>
                  <p className="text-sm text-muted-foreground">Current Page: {session.current_page}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{session.device_type}</p>
                  <p className="text-xs text-muted-foreground">
                    Last active: {new Date(session.last_activity).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
