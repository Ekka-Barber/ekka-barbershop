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

export const createEmployee = async (employeeData: Partial<Employee>): Promise<Employee> => {
  console.log('employeeService.createEmployee called with:', employeeData);
  // Simulate API call
  // const { data, error } = await supabase.from('employees').insert([employeeData]).select().single();
  // if (error) throw error;
  // return data;
  // For now, returning a mock. Replace with actual Supabase call.
  await new Promise(resolve => setTimeout(resolve, 500)); 
  const mockCreatedEmployee = {
    id: crypto.randomUUID(), 
    ...defaultFormState, // Assuming defaultFormState is available or use a proper default
    ...employeeData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Ensure all required Employee fields are present if not in employeeData or defaultFormState
    previous_working_hours: null,
    working_hours: null,
    off_days: [],
    start_date: employeeData.start_date || new Date().toISOString(),
    annual_leave_quota: typeof employeeData.annual_leave_quota === 'number' ? employeeData.annual_leave_quota : 0,
  } as Employee;
  console.log("Mock created employee:", mockCreatedEmployee);
  return mockCreatedEmployee;
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

// TODO: Add deleteEmployee function if needed

// Helper to simulate default form state if needed for mock createEmployee
// This should ideally be imported or aligned with actual form defaults
const defaultFormState = {
  name: 'Default Name',
  name_ar: '',
  branch_id: 'default-branch-id', // replace with actual default or ensure it's provided
  role: 'barber' as Employee['role'],
  nationality: 'SA',
  email: 'default@example.com',
  photo_url: '',
  salary_plan_id: undefined, // or a default plan id
  start_date: new Date().toISOString().split('T')[0],
  annual_leave_quota: 0,
}; 