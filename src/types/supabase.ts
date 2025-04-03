import { Database as DatabaseGenerated } from './supabase-generated';

export interface Database extends DatabaseGenerated {
  public: {
    Tables: {
      ui_elements: {
        Row: {
          id: string;
          type: 'button' | 'section';
          name: string;
          display_name: string;
          display_name_ar: string;
          description: string | null;
          description_ar: string | null;
          is_visible: boolean;
          display_order: number;
          icon: string | null;
          action: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['ui_elements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Omit<Database['public']['Tables']['ui_elements']['Row'], 'id' | 'created_at'>>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Re-export the supabase client with the correct types
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey); 
