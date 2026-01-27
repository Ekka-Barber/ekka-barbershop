export type SalaryCalculationType = 'fixed' | 'dynamic_basic';

export interface SalaryPlanConfig {
  blocks: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
  description?: string;
  [key: string]: unknown;
}

// Re-export from domains for backward compatibility
export type { SalaryPlan } from './domains';
