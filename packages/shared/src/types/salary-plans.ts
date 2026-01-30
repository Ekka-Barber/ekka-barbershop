export interface SalaryPlanConfig {
  blocks: Array<{
    type: string;
    config: Record<string, unknown>;
  }>;
  description?: string;
  [key: string]: unknown;
}
