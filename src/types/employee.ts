
import { Json } from './supabase-generated';
import { WorkingHours } from './service';

export interface Employee {
  id: string;
  name: string;
  name_ar?: string;
  role: 'barber' | 'receptionist' | 'manager';
  branch_id?: string;
  photo_url?: string;
  working_hours: Json;
  off_days?: string[];
  nationality?: string;
  previous_working_hours?: Json;
  salary_plan_id?: string;
  created_at?: string;
  updated_at?: string;
}
