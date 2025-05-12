// This file is a bridge to the generated Supabase types
// It helps with type imports across the application

import type { 
  Database,
  Json
} from './supabase-generated';

// Re-export basic types
export type { 
  Database,
  Json
};

// Define Tables type for use across the application
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Define additional utility types that might be needed
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 