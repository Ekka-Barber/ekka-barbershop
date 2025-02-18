
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookMarked, Clock, Route } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AggregatedMetrics {
  activeUsers: number;
  conversionRate: number;
  totalInteractions: number;
  uniquePaths: number;
}

export const LightweightMonitoring = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['aggregated-metrics'],
    queryFn: async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // Get active users (unique sessions in last 30 minutes)
      const { data: sessions, error: sessionsError } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', thirtyMinutesAgo)
        .limit(1000);

      if (sessionsError) throw sessionsError;

      // Get unique paths
      const { data: paths, error: pathsError } = await supabase
        .from('page_views')
        .select('page_url')
        .gte('created_at', thirtyMinutesAgo)
        .limit(1000);

      if (pathsError) throw pathsError;

      // Get total interactions
      const { data: interactions, error: interactionsError } = await supabase
        .from('interaction_events')
        .select('id')
        .gte('created_at', thirtyMinutesAgo)
        .limit(1000);

      if (interactionsError) throw interactionsError;

      // Calculate metrics
      const uniqueSessions = new Set(sessions?.map(s => s.session_id)).size;
      const uniquePaths = new Set(paths?.map(p => p.page_url)).size;
      const totalInteractions = interactions?.length || 0;
      
      // Calculate conversion rate (assuming conversion is reaching the final booking step)
      const { data: conversions, error: conversionsError } = await supabase
        .from('interaction_events')
        .select('session_id')
        .eq('interaction_type', 'service_selection_complete')
        .gte('created_at', thirtyMinutesAgo)
        .limit(1000);

      if (conversionsError) throw conversionsError;

      const conversionRate = uniqueSessions ? 
        ((conversions?.length || 0) / uniqueSessions) * 100 : 0;

      return {
        activeUsers: uniqueSessions,
        conversionRate,
        totalInteractions,
        uniquePaths
      };
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 4 * 60 * 1000, // Consider data stale after 4 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-32">
            <CardContent className="p-6">
              <div className="h-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Monitoring Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.conversionRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Of active sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Interactions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalInteractions || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Paths</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.uniquePaths || 0}</div>
            <p className="text-xs text-muted-foreground">Unique URLs visited</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
