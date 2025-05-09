export interface SalaryPlan {
  id: string;
  name: string;
  name_ar?: string;
  type: string; // Corresponds to salary_plans.type column (e.g., 'fixed', 'commission_based')
} 