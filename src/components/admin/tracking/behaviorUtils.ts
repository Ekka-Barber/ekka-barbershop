
import { UserJourney, UserBehaviorMetrics, PathAnalysis, DropOffPoint } from './types';
import { supabase } from '@/integrations/supabase/client';

export const analyzeBehaviorMetrics = (journeys: UserJourney[]): UserBehaviorMetrics => {
  const totalJourneys = journeys.length;
  if (totalJourneys === 0) return getEmptyMetrics();

  const completedJourneys = journeys.filter(j => j.completionStatus === 'completed');
  const durations = journeys.map(j => j.duration);
  const averageDuration = durations.reduce((a, b) => a + b, 0) / totalJourneys;

  const paths = identifyCommonPaths(journeys);
  const dropOffs = analyzeDropOffPoints(journeys);

  return {
    averageSessionDuration: averageDuration,
    bounceRate: calculateBounceRate(journeys),
    completionRate: (completedJourneys.length / totalJourneys) * 100,
    commonPaths: paths,
    dropOffPoints: dropOffs
  };
};

const getEmptyMetrics = (): UserBehaviorMetrics => ({
  averageSessionDuration: 0,
  bounceRate: 0,
  completionRate: 0,
  commonPaths: [],
  dropOffPoints: []
});

const calculateBounceRate = (journeys: UserJourney[]): number => {
  const bounces = journeys.filter(journey => 
    journey.pathSteps.length === 1 && 
    journey.duration < 30 // Less than 30 seconds
  );
  return (bounces.length / journeys.length) * 100;
};

const identifyCommonPaths = (journeys: UserJourney[]): PathAnalysis[] => {
  const pathMap = new Map<string, { count: number; durations: number[]; successes: number }>();

  journeys.forEach(journey => {
    const pathString = journey.pathSteps.map(step => step.page).join('->');
    const existing = pathMap.get(pathString) || { count: 0, durations: [], successes: 0 };

    existing.count++;
    existing.durations.push(journey.duration);
    if (journey.completionStatus === 'completed') {
      existing.successes++;
    }

    pathMap.set(pathString, existing);
  });

  return Array.from(pathMap.entries())
    .map(([path, data]) => ({
      path: path.split('->'),
      frequency: data.count,
      averageDuration: data.durations.reduce((a, b) => a + b, 0) / data.count,
      successRate: (data.successes / data.count) * 100
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5); // Top 5 paths
};

const analyzeDropOffPoints = (journeys: UserJourney[]): DropOffPoint[] => {
  const dropOffs = new Map<string, { exits: number; totalTime: number; prevPages: Set<string> }>();
  let totalPageViews = 0;

  journeys.forEach(journey => {
    journey.pathSteps.forEach((step, index) => {
      totalPageViews++;
      
      if (index === journey.pathSteps.length - 1 && journey.completionStatus === 'abandoned') {
        const existing = dropOffs.get(step.page) || { 
          exits: 0, 
          totalTime: 0, 
          prevPages: new Set<string>() 
        };

        existing.exits++;
        existing.totalTime += step.timeSpent;
        
        if (index > 0) {
          existing.prevPages.add(journey.pathSteps[index - 1].page);
        }

        dropOffs.set(step.page, existing);
      }
    });
  });

  return Array.from(dropOffs.entries())
    .map(([page, data]) => ({
      page,
      exitRate: (data.exits / totalPageViews) * 100,
      averageTimeBeforeExit: data.totalTime / data.exits,
      previousPages: Array.from(data.prevPages)
    }))
    .sort((a, b) => b.exitRate - a.exitRate);
};

export const recordUserJourney = async (journey: UserJourney) => {
  try {
    const { error } = await supabase
      .from('user_journeys')
      .insert([{
        entry_point: journey.entryPoint,
        path_steps: journey.pathSteps,
        completion_status: journey.completionStatus,
        duration: journey.duration,
        user_agent: journey.userAgent,
        timestamp: journey.timestamp
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error recording user journey:', error);
  }
};
