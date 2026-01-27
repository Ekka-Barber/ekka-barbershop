import type { Database } from '@shared/types/database.types';

export type SalaryPlan = Database['public']['Tables']['salary_plans']['Row'];
export type SalaryPlanInsert =
  Database['public']['Tables']['salary_plans']['Insert'];
export type SalaryPlanUpdate =
  Database['public']['Tables']['salary_plans']['Update'];

export type SalaryCalculationType =
  Database['public']['Enums']['salary_calculation_type'];
