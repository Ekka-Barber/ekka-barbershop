/**
 * Supabase Type Helper Functions
 * 
 * These helpers provide proper type inference for Supabase operations
 * Works around TypeScript 5.x strict mode type inference issues with supabase-js v2.x
 */

import type { Database } from '@/integrations/supabase/types';

// Helper types for better type inference
export type TableName = keyof Database['public']['Tables'];
type DatabaseTables = Database['public']['Tables'];
export type TableRow<T extends TableName> = DatabaseTables[T] extends { Row: infer R } ? R : never;
export type TableInsert<T extends TableName> = DatabaseTables[T] extends { Insert: infer I } ? I : never;
export type TableUpdate<T extends TableName> = DatabaseTables[T] extends { Update: infer U } ? U : never;

/**
 * Type-safe helper for Supabase update operations
 * Usage: .update(updateData('table_name', { field: value }))
 */
export function updateData<T extends TableName>(
  _tableName: T,
  data: Partial<TableUpdate<T>>
): Partial<TableUpdate<T>> {
  return data;
}

/**
 * Type-safe helper for Supabase insert operations
 * Usage: .insert(insertData('table_name', [{ field: value }]))
 */
export function insertData<T extends TableName>(
  _tableName: T,
  data: TableInsert<T> | TableInsert<T>[]
): TableInsert<T> | TableInsert<T>[] {
  return data;
}

/**
 * Type-safe helper for RPC function parameters
 * Usage: .rpc('function_name', rpcParams({ param: value }))
 */
export function rpcParams<T extends Record<string, unknown>>(params: T): T {
  return params;
}
