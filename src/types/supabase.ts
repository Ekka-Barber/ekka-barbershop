
import { Database as DatabaseGenerated } from './supabase-generated';

export interface Database {
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
    Enums: Record<string, never>; // Add empty Enums property to match DatabaseGenerated
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Export the supabase types but not the client - use the standardized one from integrations
export { supabase } from '@/integrations/supabase/client';
