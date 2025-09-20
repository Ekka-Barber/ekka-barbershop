/**
 * Centralized Supabase Service Wrapper
 *
 * This service provides dynamic access to the Supabase client to enable proper code splitting.
 * All static imports should be replaced with calls to getSupabaseClient().
 *
 * Usage:
 * ```typescript
 * // Instead of: import { supabase } from "@/integrations/supabase/client"
 * // Use: const supabase = await getSupabaseClient()
 * ```
 *
 * Benefits:
 * - Enables proper code splitting
 * - Reduces bundle size for non-database pages
 * - Improves build performance
 * - Maintains type safety
 */

// Import Supabase client type directly to avoid incomplete generated types
import type { SupabaseClient } from '@supabase/supabase-js';

// Cache for the Supabase client instance
let supabaseClient: SupabaseClient | null = null;

// Dynamic import function for the Supabase client
async function createSupabaseClient(): Promise<SupabaseClient> {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

/**
 * Get the Supabase client instance dynamically
 * This enables code splitting and prevents the Supabase client from being bundled
 * in chunks that don't actually use database operations.
 *
 * @returns Promise resolving to the Supabase client instance
 */
export async function getSupabaseClient(): Promise<SupabaseClient> {
  if (!supabaseClient) {
    supabaseClient = await createSupabaseClient();
  }
  return supabaseClient;
}

/**
 * Type-safe database operations wrapper
 * Provides commonly used database operations with proper typing
 */
export class SupabaseService {
  private static instance: SupabaseService | null = null;

  private constructor() {}

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Execute a database query with proper error handling
   */
  async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    try {
      const client = await getSupabaseClient();
      return await queryFn(client);
    } catch (error) {
      console.error("Supabase query error:", error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  async getSession() {
    return this.executeQuery(async (client) => {
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      return data;
    });
  }

  /**
   * Get current user
   */
  async getUser() {
    return this.executeQuery(async (client) => {
      const { data, error } = await client.auth.getUser();
      if (error) throw error;
      return data;
    });
  }
}

// Export a singleton instance for convenience
export const supabaseService = SupabaseService.getInstance();
