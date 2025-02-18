import type { ServiceBundle, PathOptimization } from "@/components/admin/tracking/types";

export interface JourneyNode {
  id: string;
  name: string;
  index?: number;
}

export interface JourneyLink {
  source: number;
  target: number;
  value: number;
}

export interface DropOffPoint {
  page: string;
  exitRate: number;
  averageTimeBeforeExit: number;
  previousPages: string[];
}

export interface ProcessedJourneyData {
  nodes: JourneyNode[];
  links: JourneyLink[];
  dropOffPoints: DropOffPoint[];
  serviceBundles: ServiceBundle[];
  pathOptimizations: PathOptimization[];
}

export interface UserJourney {
  entryPoint: string;
  pathSteps: PathStep[];
  completionStatus: 'completed' | 'abandoned';
  duration: number;
  userAgent: string;
  timestamp: string;
}

export interface PathStep {
  page: string;
  timeSpent: number;
  interactions: UserInteraction[];
}

export interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'view';
  target: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
