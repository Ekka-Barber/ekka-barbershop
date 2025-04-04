
import { Json } from './supabase-generated';

export interface Employee {
  id: string;
  name: string;
  name_ar: string | null;
  role: "barber" | "receptionist" | "manager" | "admin" | "cashier" | "hammam_specialist";
  photo_url: string | null;
  nationality: string | null;
  branch_id: string;
  working_hours: Json;
  previous_working_hours: Json;
  off_days: string[];
  created_at: string;
  updated_at: string;
  salary_plan_id: string;
}
