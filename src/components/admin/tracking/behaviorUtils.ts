
import { supabase } from "@/integrations/supabase/client";
import { PathAnalysis, DropOffPoint, UserBehaviorMetrics } from "./types";

export const getUserBehaviorMetrics = async (dateRange: { from: Date; to: Date }): Promise<UserBehaviorMetrics> => {
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

  const sessions = new Map<string, {
    duration: number;
    completed: boolean;
    path: string[];
    device: 'mobile' | 'tablet' | 'desktop';
  }>();

  pageViews?.forEach(view => {
    if (!sessions.has(view.session_id)) {
      sessions.set(view.session_id, {
        duration: 0,
        completed: false,
        path: [],
        device: view.device_type
      });
    }
    const session = sessions.get(view.session_id)!;
    session.path.push(view.page_url);
    
    if (view.entry_time && view.exit_time) {
      session.duration += new Date(view.exit_time).getTime() - new Date(view.entry_time).getTime();
    }
  });

  interactionEvents?.forEach(event => {
    if (event.session_id && event.interaction_type === 'form_interaction' && event.interaction_details?.completed) {
      const session = sessions.get(event.session_id);
      if (session) {
        session.completed = true;
      }
    }
  });

  const totalSessions = sessions.size;
  const completedSessions = Array.from(sessions.values()).filter(s => s.completed).length;
  const totalDuration = Array.from(sessions.values()).reduce((sum, s) => sum + s.duration, 0);

  const pathCounts = new Map<string, number>();
  const pathDurations = new Map<string, number[]>();
  const pathSuccess = new Map<string, number>();

  sessions.forEach(session => {
    const pathKey = session.path.join('->');
    pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
    pathSuccess.set(pathKey, (pathSuccess.get(pathKey) || 0) + (session.completed ? 1 : 0));
    
    const durations = pathDurations.get(pathKey) || [];
    durations.push(session.duration);
    pathDurations.set(pathKey, durations);
  });

  const commonPaths: PathAnalysis[] = Array.from(pathCounts.entries())
    .map(([pathKey, frequency]) => {
      const durations = pathDurations.get(pathKey) || [];
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const successCount = pathSuccess.get(pathKey) || 0;
      
      return {
        path: pathKey.split('->'),
        frequency,
        successRate: (successCount / frequency) * 100,
        averageDuration: avgDuration,
        commonPaths: [pathKey.split('->')],
        dropOffPoints: [],
        conversionRate: (successCount / frequency) * 100,
        averageTimeToComplete: avgDuration
      };
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const dropOffPoints: DropOffPoint[] = Array.from(sessions.values())
    .filter(session => !session.completed && session.path.length > 0)
    .reduce((acc, session) => {
      const lastPage = session.path[session.path.length - 1];
      const point = acc.find(p => p.page === lastPage);
      
      if (point) {
        point.rate++;
        point.exitRate = (point.rate / totalSessions) * 100;
      } else {
        acc.push({
          page: lastPage,
          rate: 1,
          exitRate: (1 / totalSessions) * 100,
          averageTimeBeforeExit: session.duration,
          previousPages: session.path.slice(0, -1)
        });
      }
      return acc;
    }, [] as DropOffPoint[]);

  const deviceCounts = Array.from(sessions.values()).reduce(
    (acc, session) => {
      acc[session.device]++;
      return acc;
    },
    { mobile: 0, tablet: 0, desktop: 0 }
  );

  const timePatterns = Array.from(sessions.values()).reduce((acc, session) => {
    const hour = new Date(session.duration).getHours();
    if (!acc[hour]) {
      acc[hour] = {
        hour,
        total: 0,
        mobile: 0,
        tablet: 0,
        desktop: 0
      };
    }
    acc[hour].total++;
    acc[hour][session.device]++;
    return acc;
  }, {} as Record<number, { hour: number; total: number; mobile: number; tablet: number; desktop: number; }>);

  return {
    totalSessions,
    averageSessionDuration: totalSessions ? totalDuration / totalSessions : 0,
    bounceRate: ((totalSessions - completedSessions) / totalSessions) * 100,
    conversionRate: (completedSessions / totalSessions) * 100,
    completionRate: (completedSessions / totalSessions) * 100,
    deviceDistribution: {
      mobile: (deviceCounts.mobile / totalSessions) * 100,
      tablet: (deviceCounts.tablet / totalSessions) * 100,
      desktop: (deviceCounts.desktop / totalSessions) * 100
    },
    pathAnalysis: commonPaths[0] || {
      path: [],
      frequency: 0,
      successRate: 0,
      averageDuration: 0,
      commonPaths: [],
      dropOffPoints: [],
      conversionRate: 0,
      averageTimeToComplete: 0
    },
    timePatterns: Object.values(timePatterns),
    commonPaths,
    dropOffPoints
  };
};
