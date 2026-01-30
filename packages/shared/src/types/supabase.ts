// This file is a bridge to the generated Supabase types
// It helps with type imports across the application

import type { Database } from '../lib/supabase/types';

// Define Tables type for use across the application
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
