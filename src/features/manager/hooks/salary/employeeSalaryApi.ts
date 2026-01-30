
import { supabase } from '@shared/lib/supabase/client';

export async function fetchSalaryPlan(salaryPlanId: string) {
  return await supabase
    .from('salary_plans')
    .select('id, name, type, config')
    .eq('id', salaryPlanId)
    .single();
}
