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

// Replace the mock createEmployee function with the actual Supabase implementation.
export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  if (!employeeData.name || !employeeData.role || !employeeData.branch_id) {
    console.error('Create employee called with missing required fields (name, role, or branch_id).', employeeData);
    throw new Error('Cannot create employee: Name, Role, and Branch ID are required.');
  }

  const payloadToInsert = {
    name: employeeData.name, // Known to be string
    role: employeeData.role,   // Known to be EmployeeRole
    branch_id: employeeData.branch_id, // Known to be string
    name_ar: employeeData.name_ar || null,
    nationality: employeeData.nationality || null,
    email: employeeData.email || null,
    photo_url: employeeData.photo_url || null,
    salary_plan_id: employeeData.salary_plan_id || null,
    start_date: employeeData.start_date || null,
    annual_leave_quota: employeeData.annual_leave_quota, // Already number | null from EmployeeForm
    // Fields like working_hours, off_days, previous_working_hours are omitted
    // as they are low priority and might not be in Employee type or are handled by DB defaults.
  };

  try {
    const { data: newEmployee, error: supabaseError } = await supabase
      .from('employees')
      .insert(payloadToInsert)
      .select()
      .single();

    if (supabaseError) {
      console.error('Error creating employee in Supabase:', supabaseError);
      throw new Error(`Failed to create employee: ${supabaseError.message}`);
    }

    if (!newEmployee) {
      console.error('No data returned from Supabase after creating employee.');
      throw new Error('Failed to create employee: No data returned after insert.');
    }

    return newEmployee as Employee;
  } catch (e) {
    // Catch any other unexpected errors (network issues, etc.)
    const error = e instanceof Error ? e : new Error('An unexpected error occurred during employee creation');
    console.error('Unexpected error in createEmployee service:', error);
    throw error; // Re-throw the error to be caught by the calling function (in EmployeesTab)
  }
};

export const uploadEmployeePhoto = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${fileName}`; // In a public bucket, the path can be just the filename

  // console.log(`Uploading file to Supabase Storage: ${filePath}`);

  const { error: uploadError } = await supabase.storage
    .from('employee_photos')
    .upload(filePath, file, { 
      cacheControl: '3600',
      upsert: false // true to overwrite if file with same name exists, false to error
    });

  if (uploadError) {
    console.error('Error uploading photo to Supabase Storage:', uploadError);
    throw new Error(`Failed to upload photo: ${uploadError.message}`);
  }

  // console.log('File uploaded successfully, getting public URL...');

  const { data } = supabase.storage
    .from('employee_photos')
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    console.error('Error getting public URL for photo from Supabase Storage.');
    // Attempt to remove the uploaded file if we can't get its URL, to prevent orphans
    // This is optional and depends on how critical it is to avoid orphaned files
    // await supabase.storage.from('employee_photos').remove([filePath]);
    throw new Error('Failed to get public URL for the uploaded photo.');
  }

  // console.log('Public URL retrieved:', data.publicUrl);
  return data.publicUrl;
};

/**
 * Sets the archived status of an employee in the database.
 *
 * @param employeeId The UUID of the employee to update.
 * @param isArchived The new archive status (true for archived, false for active).
 * @returns An object with `error` (any error that occurred or null).
 */
export async function setEmployeeArchiveStatus(
  employeeId: string,
  isArchived: boolean
): Promise<{ error: Error | null }> {
  try {
    const { error: supabaseError } = await supabase
      .from('employees')
      .update({ is_archived: isArchived })
      .eq('id', employeeId);

    if (supabaseError) {
      console.error(`Error setting archive status for employee ${employeeId}:`, supabaseError);
      return { error: new Error(supabaseError.message) };
    }

    return { error: null };
  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unexpected error occurred while setting employee archive status');
    console.error('Unexpected error in setEmployeeArchiveStatus:', error);
    return { error };
  }
}