
import { supabase } from "@/integrations/supabase/client";
import { PathAnalysis, DropOffPoint, UserBehaviorMetrics } from "./types";

export const getUserBehaviorMetrics = async (dateRange: { from: Date; to: Date }): Promise<UserBehaviorMetrics> => {
  // Fetch interaction events and page views from existing tables
  const { data: interactionEvents } = await supabase
    .from('interaction_events')
    .select('*')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString());

  const { data: pageViews } = await supabase
    .from('page_views')
    .select('*')
    .gte('created_at', dateRange.from.toISOString())
    .lte('created_at', dateRange.to.toISOString());

  // Calculate metrics from actual data
  const sessions = new Map<string, {
    duration: number;
    completed: boolean;
    path: string[];
  }>();

  // Process page views into sessions
  pageViews?.forEach(view => {
    if (view.session_id) {
      if (!sessions.has(view.session_id)) {
        sessions.set(view.session_id, {
          duration: 0,
          completed: false,
          path: []
        });
      }
      
      const session = sessions.get(view.session_id)!;
      session.path.push(view.page_url);
      
      if (view.entry_time && view.exit_time) {
        session.duration += new Date(view.exit_time).getTime() - new Date(view.entry_time).getTime();
      }
    }
  });

  // Process interaction events to mark completed sessions
  interactionEvents?.forEach(event => {
    if (event.session_id && event.interaction_type === 'form_interaction' && event.interaction_details?.completed) {
      const session = sessions.get(event.session_id);
      if (session) {
        session.completed = true;
      }
    }
  });

  // Calculate metrics
  const totalSessions = sessions.size;
  const completedSessions = Array.from(sessions.values()).filter(s => s.completed).length;
  const totalDuration = Array.from(sessions.values()).reduce((sum, s) => sum + s.duration, 0);

  // Analyze common paths
  const pathCounts = new Map<string, number>();
  sessions.forEach(session => {
    const pathKey = session.path.join('->');
    pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
  });

  const commonPaths: PathAnalysis[] = Array.from(pathCounts.entries())
    .map(([path, frequency]) => ({
      path: path.split('->'),
      frequency,
      averageDuration: 0, // Calculate from session durations with this path
      successRate: 0 // Calculate from completed sessions with this path
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  // Find drop-off points
  const dropOffPoints: DropOffPoint[] = Array.from(sessions.values())
    .filter(session => !session.completed && session.path.length > 0)
    .reduce((acc, session) => {
      const lastPage = session.path[session.path.length - 1];
      const existing = acc.find(p => p.page === lastPage);
      if (existing) {
        existing.exitRate += 1;
        existing.previousPages.push(...session.path.slice(0, -1));
      } else {
        acc.push({
          page: lastPage,
          exitRate: 1,
          averageTimeBeforeExit: session.duration,
          previousPages: session.path.slice(0, -1)
        });
      }
      return acc;
    }, [] as DropOffPoint[])
    .map(point => ({
      ...point,
      exitRate: (point.exitRate / totalSessions) * 100,
      previousPages: Array.from(new Set(point.previousPages))
    }));

  return {
    averageSessionDuration: totalSessions ? totalDuration / totalSessions : 0,
    bounceRate: ((totalSessions - completedSessions) / totalSessions) * 100,
    completionRate: (completedSessions / totalSessions) * 100,
    commonPaths,
    dropOffPoints
  };
};
