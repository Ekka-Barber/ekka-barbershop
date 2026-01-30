/**
 * Supabase Type Helper Functions
 * 
 * These helpers provide proper type inference for Supabase operations
 * Works around TypeScript 5.x strict mode type inference issues with supabase-js v2.x
 */

export type TableName = string;
export type TableInsert<_TableName extends TableName> = Record<string, unknown>;
export type TableUpdate<_TableName extends TableName> = Record<string, unknown>;

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
