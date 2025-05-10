// ... existing code ...
// END OF SECTION 1 (Resolving 401/400 errors - Keep this section as is)
// ... existing code ...

// Remove old Section 2 and Section 3. The following is the new plan:

## Section 2: New Salary Payment Confirmation & History System

**Objective:** Implement a new system where a single, comprehensive record of an employee's fully calculated salary components for a specific month is stored upon user confirmation. This record will be the source of truth for the new "Salary History" tab.

**Assumption:** All salary calculations (base, sales, commission, total bonuses, total deductions, total loans, net pay) are finalized in the frontend (likely within the `EmployeeSalary` objects managed by `useSalaryData`) before the confirmation step. This new table will store a snapshot of these frontend-calculated values.

### Phase 1: Database Design & Setup

#### Sub-Task 2.1.1: Design `employee_monthly_salary_snapshots` Table
*   **Purpose:** This table will store a complete snapshot of all calculated salary components for an employee for a specific month, as confirmed from the frontend.
*   **SQL Script for New Table:**
    ```sql
    CREATE TABLE public.employee_monthly_salary_snapshots (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
        employee_name_snapshot TEXT NOT NULL, -- Name of the employee at the time of confirmation
        month_year TEXT NOT NULL, -- Format "YYYY-MM", e.g., "2023-12"
        payment_confirmation_date DATE NOT NULL, -- Date the payment was confirmed by the user
        
        base_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        sales_amount NUMERIC(10, 2) DEFAULT 0.00,
        commission_amount NUMERIC(10, 2) DEFAULT 0.00,
        total_bonuses NUMERIC(10, 2) DEFAULT 0.00,    -- Sum of all bonuses for the period
        total_deductions NUMERIC(10, 2) DEFAULT 0.00, -- Sum of all deductions for the period
        total_loan_repayments NUMERIC(10, 2) DEFAULT 0.00, -- Sum of all loan repayments for the period
        net_salary_paid NUMERIC(10, 2) NOT NULL, -- The final net amount confirmed/paid
        
        salary_plan_id_snapshot uuid REFERENCES public.salary_plans(id) ON DELETE SET NULL, -- Salary plan ID at confirmation
        salary_plan_name_snapshot TEXT, -- Salary plan name at confirmation
        
        calculation_details_json JSONB, -- Optional: Store the frontend EmployeeSalary object or similar for detailed audit
        
        confirmed_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- User who confirmed
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );

    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.month_year IS 'Pay period in YYYY-MM format';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.employee_name_snapshot IS 'Name of the employee at the time of salary confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.payment_confirmation_date IS 'Date the payment was confirmed by the user in the dialog';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.total_bonuses IS 'Sum of all bonuses for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.total_deductions IS 'Sum of all deductions for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.total_loan_repayments IS 'Sum of all loan repayments for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.net_salary_paid IS 'The final net salary amount that was paid/confirmed';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.salary_plan_id_snapshot IS 'Snapshot of the employee\'s salary_plan_id at the time of confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.salary_plan_name_snapshot IS 'Snapshot of the employee\'s salary_plan_name at the time of confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary_snapshots.calculation_details_json IS 'Optional: JSON representation of the full frontend salary calculation object for audit purposes';
    ```

#### Sub-Task 2.1.2: Create Indexes for `employee_monthly_salary_snapshots`
*   **SQL Script for Indexes:**
    ```sql
    -- Index for common lookups
    CREATE INDEX idx_emss_employee_month ON public.employee_monthly_salary_snapshots(employee_id, month_year);
    CREATE INDEX idx_emss_month_year ON public.employee_monthly_salary_snapshots(month_year);
    CREATE INDEX idx_emss_payment_confirmation_date ON public.employee_monthly_salary_snapshots(payment_confirmation_date);
    CREATE INDEX idx_emss_confirmed_by_user_id ON public.employee_monthly_salary_snapshots(confirmed_by_user_id);
    ```

#### Sub-Task 2.1.3: Define RLS for `employee_monthly_salary_snapshots`
*   **SQL Script for RLS Policy:**
    ```sql
    -- Enable RLS
    ALTER TABLE public.employee_monthly_salary_snapshots ENABLE ROW LEVEL SECURITY;

    -- Policy for admin user (replace 'your_actual_admin_auth_user_id' with the admin user's ID from auth.users)
    -- Ensure you retrieve this ID from your Supabase project (e.g., from logs as per Section 1.2)
    -- CREATE POLICY "Admin full access to monthly salary snapshots"
    -- ON public.employee_monthly_salary_snapshots
    -- FOR ALL
    -- USING (auth.uid() = 'your_actual_admin_auth_user_id') 
    -- WITH CHECK (auth.uid() = 'your_actual_admin_auth_user_id');

    -- OR, a more general policy for any authenticated user (simpler to start with if admin UID isn't immediately available)
    CREATE POLICY "Allow ALL for authenticated users on monthly salary snapshots"
    ON public.employee_monthly_salary_snapshots
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
    ```
    *It's crucial to eventually secure this appropriately based on your access control needs.*

#### Sub-Task 2.1.4: Handle Existing `salary_history` Table
*   **Action:** The existing `salary_history` table will be replaced by `employee_monthly_salary_snapshots`. It should be archived or dropped.
*   **Recommendation:** Rename to `salary_history_archived` to preserve data if needed for reference.
*   **SQL Script (choose one):**
    *   To rename: `ALTER TABLE public.salary_history RENAME TO salary_history_archived;`
    *   To drop (ensure data is backed up or not needed): `DROP TABLE IF EXISTS public.salary_history;`
*   **Note:** If renaming, review and potentially drop/rename triggers and indexes associated with the old `salary_history` table if they are no longer relevant or cause conflicts. For example, the trigger `update_salary_history_updated_at` will be on the renamed table.

### Phase 2: Frontend - Updating Payment Confirmation Logic

#### Sub-Task 2.2.1: Modify Payment Confirmation Data Gathering & Processing
*   **File:** `src/components/admin/employee-management/salary/components/SalaryTable.tsx` (or the component containing the primary "Confirm Payment" logic, specifically the function passed as `onConfirm` to `PaymentConfirmation.tsx`).
*   **Function to Modify:** The existing `handlePaymentConfirm` function (or its equivalent).
*   **Logic Update:**
    1.  This function receives the `paymentDate` from the `PaymentConfirmation` dialog.
    2.  It should access the `salaryData` array (from `useSalaryData` hook), which contains `EmployeeSalary` objects for all employees for the `selectedMonth`.
    3.  It needs to iterate through each `employeeData` in `salaryData` (or only those selected for payment if that's a feature).
    4.  For each `employeeData`:
        *   Retrieve the corresponding full `Employee` object to get `employee.id` and `employee.name` (for `employee_name_snapshot`), `employee.salary_plan_id` (for `salary_plan_id_snapshot`).
        *   Fetch the `salary_plan_name` using `employee.salary_plan_id` from the `salaryPlans` data (available in `useSalaryData`'s context or refetch if necessary).
        *   Construct a `snapshotRecord` object with the following mapping from `employeeData` (which is of type `EmployeeSalary`) and other context:
            *   `employee_id`: `employeeData.id`
            *   `employee_name_snapshot`: `employee.name`
            *   `month_year`: The `selectedMonth` state (e.g., "2023-12").
            *   `payment_confirmation_date`: The `paymentDate` from the dialog.
            *   `base_salary`: `employeeData.baseSalary`
            *   `sales_amount`: `employeeData.salesAmount || 0`
            *   `commission_amount`: `employeeData.commission || 0`
            *   `total_bonuses`: `(employeeData.bonus || 0) + (employeeData.targetBonus || 0)` (Ensure this accurately reflects sum of all bonuses for the period. The `EmployeeSalary` type might need adjustment if `bonus` and `targetBonus` are not the complete sum.)
            *   `total_deductions`: `employeeData.deductions || 0`
            *   `total_loan_repayments`: `employeeData.loans || 0`
            *   `net_salary_paid`: `employeeData.total`
            *   `salary_plan_id_snapshot`: `employee.salary_plan_id`
            *   `salary_plan_name_snapshot`: The fetched salary plan name.
            *   `calculation_details_json` (optional): `JSON.stringify(employeeData)`
            *   `confirmed_by_user_id`: `(await supabase.auth.getUser()).data.user?.id` (ensure user is fetched correctly).
    5.  Collect all `snapshotRecord` objects into an array.

#### Sub-Task 2.2.2: Update Supabase Insert Call
*   **File:** Same as Sub-Task 2.2.1.
*   **Action:**
    *   Modify the Supabase call:
      `const { data, error } = await supabase.from('employee_monthly_salary_snapshots').insert(arrayOfSnapshotRecords).select();`
    *   Ensure robust error logging (as detailed in Section 1) and user feedback (success/failure messages).
    *   The `onConfirm` prop in `PaymentConfirmation.tsx` should return `true` on successful insert, `false` otherwise.

### Phase 3: Frontend - New "Salary History" Sub-Tab in Salary Dashboard

#### Sub-Task 2.3.1: Add New Tab to Salary Dashboard
*   **File:** `src/components/admin/employee-management/salary/SalaryDashboard.tsx`
*   **UI Element:**
    *   In the `<Tabs>` component, add a new `<TabsTrigger value="history">Salary History</TabsTrigger>`.
    *   Add a corresponding `<TabsContent value="history">...</TabsContent>` section.

#### Sub-Task 2.3.2: Create Data Fetching Hook for Salary History
*   **File Path (New):** `src/components/admin/employee-management/salary/hooks/useSalaryHistorySnapshots.ts`
*   **Function Signature:** `export const useSalaryHistorySnapshots = (filters: { employeeId?: string; monthYear?: string; limit?: number; offset?: number; }) => { ... }`
*   **Logic:**
    *   Uses `@tanstack/react-query` for data fetching (e.g., `useQuery`).
    *   Query key should include filters to ensure proper caching and refetching.
    *   Constructs a Supabase query to `employee_monthly_salary_snapshots`.
        ```javascript
        let query = supabase.from('employee_monthly_salary_snapshots').select('*').order('payment_confirmation_date', { ascending: false });
        if (filters.employeeId) query = query.eq('employee_id', filters.employeeId);
        if (filters.monthYear) query = query.eq('month_year', filters.monthYear);
        if (filters.limit) query = query.limit(filters.limit);
        if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit -1);
        const { data, error, count } = await query;
        ```
    *   Returns `{ historySnapshots: data || [], isLoading, error, refetch, count }`.

#### Sub-Task 2.3.3: Design and Implement Salary History Display Component
*   **File Path (New):** `src/components/admin/employee-management/salary/components/SalaryHistorySnapshotsTable.tsx`
*   **Props:** `interface SalaryHistorySnapshotsTableProps { snapshots: SnapshotRecordType[]; isLoading: boolean; }` (Define `SnapshotRecordType` based on table columns).
*   **UI Element:** A table component (e.g., using `@/components/ui/table`).
*   **Columns to Display (suggestion):**
    *   `Employee Name (Snapshot)`
    *   `Month/Year`
    *   `Payment Confirmation Date`
    *   `Net Salary Paid`
    *   `Base Salary`
    *   `Total Bonuses`
    *   `Total Deductions`
    *   Action column for "View Details" (if `calculation_details_json` is to be shown in a modal/drawer).
*   **Features:** Display loading state, handle empty state.

#### Sub-Task 2.3.4: Integrate History Display into Salary Dashboard Tab
*   **File:** `src/components/admin/employee-management/salary/SalaryDashboard.tsx`
*   **Inside `<TabsContent value="history">`:**
    1.  **UI Elements for Filtering:**
        *   Employee Selector (Dropdown): To filter by `employeeId`. Populate with employees list.
        *   Month/Year Picker: To filter by `month_year`.
        *   "Apply Filters" Button.
    2.  **State Management:** Use `useState` for filter values (e.g., `selectedHistoryEmployee`, `selectedHistoryMonth`).
    3.  **Data Fetching:**
        *   Call `useSalaryHistorySnapshots` with current filter states.
    4.  **Display:**
        *   Render `<SalaryHistorySnapshotsTable snapshots={historySnapshots} isLoading={isLoading} />`.
        *   Implement pagination if many records are expected, using `limit`, `offset` and `count` from the hook.

### Phase 4: Testing and Refinement

#### Sub-Task 2.4.1: Test Payment Confirmation Thoroughly
*   Confirm a payment for a single employee. Verify all fields in the `employee_monthly_salary_snapshots` table are populated correctly and match the frontend calculations.
*   Confirm payments for multiple employees (if batch confirmation is intended).
*   Test edge cases: zero values for optional numeric fields, missing optional fields.
*   Verify `confirmed_by_user_id` is populated.

#### Sub-Task 2.4.2: Test "Salary History" Tab Functionality
*   Verify data display is accurate in `SalaryHistorySnapshotsTable`.
*   Test all filters (employee, month/year) individually and in combination.
*   Test pagination if implemented.
*   Test UI responsiveness and loading/empty states.

#### Sub-Task 2.4.3: Code Review and Cleanup
*   Review all new and modified code for clarity, correctness, and adherence to project standards.
*   Address any new console errors or linter warnings.
*   Ensure proper error handling and user feedback for all operations.

This revised Section 2 provides a clear path towards your goal of a simplified, frontend-driven salary confirmation log.
Remember to replace 'your_actual_admin_auth_user_id' in the RLS policy with the correct ID.
This plan assumes the `EmployeeSalary` type in your frontend already contains the necessary summarized values for bonuses, deductions, and loans. If not, the logic in `useSalaryData` or `useSalaryCalculation` that populates `EmployeeSalary` might need minor adjustments to ensure these totals are explicitly available.
