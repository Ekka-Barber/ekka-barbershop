import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types/employee';

/**
 * Updates an existing employee record in the database.
 *
 * @param id The UUID of the employee to update.
 * @param data An object containing the employee fields to update.
 *             Should be Partial<Employee> to allow updating only specific fields.
 * @returns An object with `data` (the updated employee record or null) and `error` (any error that occurred or null).
 */
export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<{ data: Employee | null; error: Error | null }> {
  try {
    const { data: updatedEmployee, error: supabaseError } = await supabase
      .from('employees')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (supabaseError) {
      console.error('Error updating employee:', supabaseError);
      // You might want to map supabaseError to a generic Error or a custom error type
      return { data: null, error: new Error(supabaseError.message) };
    }

    return { data: updatedEmployee as Employee | null, error: null };
  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unexpected error occurred during employee update');
    console.error('Unexpected error in updateEmployee:', error);
    return { data: null, error };
  }
}

// Placeholder for createEmployee function - to be implemented later as per the plan
/**
 * Creates a new employee record in the database.
 *
 * @param newData An object containing the data for the new employee.
 *                Should be Omit<Employee, 'id' | 'created_at' | 'updated_at'> or a specific create type.
 * @returns An object with `data` (the created employee record or null) and `error` (any error that occurred or null).
 */
// export async function createEmployee(
//   newData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>
// ): Promise<{ data: Employee | null; error: Error | null }> {
//   try {
//     const { data: newEmployee, error: supabaseError } = await supabase
//       .from('employees')
//       .insert(newData)
//       .select()
//       .single();
// 
//     if (supabaseError) {
//       console.error('Error creating employee:', supabaseError);
//       return { data: null, error: new Error(supabaseError.message) };
//     }
// 
//     return { data: newEmployee as Employee | null, error: null };
//   } catch (e) {
//     const error = e instanceof Error ? e : new Error('An unexpected error occurred during employee creation');
//     console.error('Unexpected error in createEmployee:', error);
//     return { data: null, error };
//   }
// } 