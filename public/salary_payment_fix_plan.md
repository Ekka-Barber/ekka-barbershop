// ... existing code ...
// END OF SECTION 1 (Resolving 401/400 errors - Keep this section as is)
// ... existing code ...

// Remove old Section 2 and Section 3. The following is the new plan:

## Progress Overview
- [####################] 100% Phase 1: Database Design & Setup - Complete
- [####----------------] 20% Phase 2: Frontend - Updating Payment Confirmation Logic - In Progress with Issues
- [--------------------] 0% Phase 3: Frontend - New "Salary History" Sub-Tab in Salary Dashboard - Not Started
- [--------------------] 0% Phase 4: Testing and Refinement - Not Started
- [--------------------] 0% Phase 5: Future Considerations - Not Implemented (Optional)

**Overall Progress: 35% Complete** (Calculated based on completion of 5 out of 15 core sub-tasks across Phases 1-4)

## New Salary Payment Confirmation & History System

**Objective:** Implement a new system where a single, comprehensive record of an employee's fully calculated salary components for a specific month is stored upon user confirmation. This record will be the source of truth for the new "Salary History" tab.

**Assumption:** All salary calculations (base, sales, commission, total bonuses, total deductions, total loans, net pay) are finalized in the frontend (likely within the `EmployeeSalary` objects managed by `useSalaryData`) before the confirmation step. This new table will store a snapshot of these frontend-calculated values.

### Phase 1: Database Design & Setup

> ⚠️ **WARNING: DO NOT MODIFY ANY SALARY CALCULATION LOGIC** 
> This phase only involves database schema changes with no impact on how salaries are calculated.

#### Sub-Task 1.1.1: Design `employee_monthly_salary` Table (100% Complete)
*   **Purpose:** This table will store a complete snapshot of all calculated salary components for an employee for a specific month, as confirmed from the frontend.
*   **Decisions Made:**
    *   Table name changed from `employee_monthly_salary_snapshots` to `employee_monthly_salary` for brevity.
    *   The `confirmed_by_user_id` column was removed as the application is used by a single admin.
*   **Considerations (Original):**
    *   Add `currency` column if multi-currency support is anticipated in the future. (Retained as optional)
    *   Consider `employee_role_snapshot` or `employee_department_snapshot` for historical reporting needs. (Retained as optional)
    *   A `status` column (e.g., 'confirmed', 'pending_correction') could be added if a more complex workflow is needed beyond simple confirmation. (Not implemented)
*   **SQL Script for New Table (as implemented):**
    ```sql
    CREATE TABLE public.employee_monthly_salary (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE RESTRICT,
        employee_name_snapshot TEXT NOT NULL, -- Name of the employee at the time of confirmation
        -- employee_role_snapshot TEXT, -- Optional: Role of the employee at the time of confirmation
        month_year TEXT NOT NULL, -- Format "YYYY-MM", e.g., "2023-12"
        payment_confirmation_date DATE NOT NULL, -- Date the payment was confirmed by the user
        
        base_salary NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
        sales_amount NUMERIC(10, 2) DEFAULT 0.00,
        commission_amount NUMERIC(10, 2) DEFAULT 0.00,
        total_bonuses NUMERIC(10, 2) DEFAULT 0.00,    -- Sum of all bonuses for the period
        total_deductions NUMERIC(10, 2) DEFAULT 0.00, -- Sum of all deductions for the period
        total_loan_repayments NUMERIC(10, 2) DEFAULT 0.00, -- Sum of all loan repayments for the period
        net_salary_paid NUMERIC(10, 2) NOT NULL, -- The final net amount confirmed/paid
        -- currency TEXT DEFAULT 'USD', -- Optional: Add if multi-currency is a possibility

        salary_plan_id_snapshot uuid REFERENCES public.salary_plans(id) ON DELETE SET NULL, -- Salary plan ID at confirmation
        salary_plan_name_snapshot TEXT, -- Salary plan name at confirmation
        
        calculation_details_json JSONB, -- Optional: Store the frontend EmployeeSalary object or similar for detailed audit
        
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now(),

        CONSTRAINT month_year_format CHECK (month_year ~ '^\d{4}-(0[1-9]|1[0-2])$') -- Ensures YYYY-MM format
    );

    COMMENT ON TABLE public.employee_monthly_salary IS 'Stores a snapshot of all calculated salary components for an employee for a specific month, confirmed from the frontend.';
    COMMENT ON COLUMN public.employee_monthly_salary.month_year IS 'Pay period in YYYY-MM format. Enforced by a CHECK constraint.';
    COMMENT ON COLUMN public.employee_monthly_salary.employee_name_snapshot IS 'Name of the employee at the time of salary confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary.payment_confirmation_date IS 'Date the payment was confirmed by the user in the dialog';
    COMMENT ON COLUMN public.employee_monthly_salary.total_bonuses IS 'Sum of all bonuses for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary.total_deductions IS 'Sum of all deductions for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary.total_loan_repayments IS 'Sum of all loan repayments for the employee for this month_year';
    COMMENT ON COLUMN public.employee_monthly_salary.net_salary_paid IS 'The final net salary amount that was paid/confirmed';
    COMMENT ON COLUMN public.employee_monthly_salary.salary_plan_id_snapshot IS 'Snapshot of the employee's salary_plan_id at the time of confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary.salary_plan_name_snapshot IS 'Snapshot of the employee's salary_plan_name at the time of confirmation';
    COMMENT ON COLUMN public.employee_monthly_salary.calculation_details_json IS 'Optional: JSON representation of the full frontend salary calculation object for audit purposes';
    -- COMMENT ON COLUMN public.employee_monthly_salary.currency IS 'Currency code for the amounts, e.g., USD, EUR';
    -- COMMENT ON COLUMN public.employee_monthly_salary.employee_role_snapshot IS 'Optional: Role of the employee at the time of confirmation';
    ```

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

#### Sub-Task 1.1.2: Create Indexes for `employee_monthly_salary` (100% Complete)
*   **SQL Script for Indexes (as implemented):**
    ```sql
    -- Index for common lookups
    CREATE INDEX idx_ems_employee_month ON public.employee_monthly_salary(employee_id, month_year);
    CREATE INDEX idx_ems_month_year ON public.employee_monthly_salary(month_year);
    CREATE INDEX idx_ems_payment_confirmation_date ON public.employee_monthly_salary(payment_confirmation_date);
    -- Note: Index for confirmed_by_user_id was removed as the column was removed.
    -- CREATE INDEX idx_ems_salary_plan_id_snapshot ON public.employee_monthly_salary(salary_plan_id_snapshot); -- Optional: If filtering by salary plan snapshot is common
    ```

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

#### Sub-Task 1.1.3: Define RLS for `employee_monthly_salary` (100% Complete)
*   **Guidance:** Start with a simple policy for authenticated users (if this is an admin-only panel) or a specific admin `user_id`. Refine based on actual roles and access needs (e.g., HR, managers).
*   **Decision Made:** As the application is used by a single admin (the authenticated user), a policy granting full access to any authenticated user was implemented.
*   **SQL Script for RLS Policy (as implemented):**
    ```sql
    -- Enable RLS
    ALTER TABLE public.employee_monthly_salary ENABLE ROW LEVEL SECURITY;

    -- Policy allowing any authenticated user full access
    CREATE POLICY "Allow full access for authenticated users"
    ON public.employee_monthly_salary
    FOR ALL -- This applies to SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (true) -- Allows all rows to be visible/queried
    WITH CHECK (true); -- Allows all inserts/updates
    ```
    *It's crucial to implement appropriate RLS. The "Allow ALL for authenticated" is a placeholder for development and must be secured.* (Note: This warning is less critical in a single-user scenario but retained for good practice).

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

#### Sub-Task 1.1.4: Handle Existing `salary_history` Table (100% Complete)
*   **Action:** The existing `salary_history` table was replaced by `employee_monthly_salary`.
*   **Decision Made:** The table `public.salary_history` was dropped using `DROP TABLE IF EXISTS public.salary_history CASCADE;`. This ensures all dependent objects like triggers, indexes, and foreign key constraints were also removed.
*   **SQL Script (as executed):**
    *   `DROP TABLE IF EXISTS public.salary_history CASCADE;`
*   **Note:** This action is irreversible. Data backup prior to dropping was advised if historical data was needed.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

#### Sub-Task 1.1.5: Review `EmployeeSalary` Type (Frontend) (100% Complete)
*   **Action:** Reviewed the `EmployeeSalary` TypeScript type definition from `src/components/admin/employee-management/salary/hooks/utils/salaryTypes.ts`.
*   **Objective:** Ensured it comprehensively includes all individual components that make up totals OR that the existing total fields are accurately calculated from all underlying sources in the frontend.
*   **Rationale:** This ensures the `calculation_details_json` snapshot is complete and the summarized figures stored directly in the table are correct and auditable.
*   **Findings & Conclusion:**
    *   The `EmployeeSalary` type definition is:
        ```typescript
        export interface EmployeeSalary {
          id: string;
          name: string;
          salesAmount?: number;
          baseSalary: number;
          commission: number;
          bonus: number;
          targetBonus?: number;
          deductions: number;
          loans: number;
          total: number; // This will map to net_salary_paid
          calculationError?: string;
        }
        ```
    *   The mapping to the `employee_monthly_salary` table will be as follows:
        *   `base_salary` (DB) from `EmployeeSalary.baseSalary`.
        *   `sales_amount` (DB) from `EmployeeSalary.salesAmount` (or 0).
        *   `commission_amount` (DB) from `EmployeeSalary.commission`.
        *   `total_bonuses` (DB) will be calculated as `(EmployeeSalary.bonus || 0) + (EmployeeSalary.targetBonus || 0)`. This assumes these are the sole components of total bonuses within `EmployeeSalary`.
        *   `total_deductions` (DB) will be taken directly from `EmployeeSalary.deductions`. This assumes `EmployeeSalary.deductions` is a comprehensive sum.
        *   `total_loan_repayments` (DB) will be taken directly from `EmployeeSalary.loans`. This assumes `EmployeeSalary.loans` is a comprehensive sum.
        *   `net_salary_paid` (DB) from `EmployeeSalary.total`.
    *   The `calculation_details_json` field in the database will store the stringified `EmployeeSalary` object, providing a full audit trail of the frontend-calculated values.
    *   No changes were required for the `EmployeeSalary` type itself for this phase, aligning with the directive not to alter existing calculation logic. The type is deemed adequate for snapshotting.

> ⚠️ **WARNING: This is only a review task. DO NOT modify how the existing salary calculation works.** (Adhered to)
> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

### Phase 2: Frontend - Updating Payment Confirmation Logic

> ⚠️ **WARNING: DO NOT MODIFY ANY SALARY CALCULATION LOGIC**
> This phase focuses on storing the already-calculated salary data, not changing how it's calculated.
> The `useSalaryData` hook and calculators in `/src/lib/salary` must remain untouched.

#### Sub-Task 2.1.1: Modify Payment Confirmation Data Gathering & Processing (100% Complete)
*   **File:** `src/components/admin/employee-management/salary/components/SalaryTable.tsx`.
*   **Function to Modify:** The existing `handlePaymentConfirm` function.
*   **Current State of `handlePaymentConfirm` (as of review on YYYY-MM-DD - replace with actual date):**
    *   Located in `SalaryTable.tsx`.
    *   Signature: `async (paymentDate: Date, employeeId: string, employeeData: EmployeeSalary, employeeDetailsFromQuery: EmployeeQueryResult | undefined): Promise<boolean>`
    *   It currently gathers data very similar to what's needed for the snapshot.
    *   It constructs a `recordToInsertObject` and attempts to insert it into the old `salary_history` table.
    *   Key data points it already prepares: `employeeId`, `employeeData.name`, `paymentDate` (for `month_year` and `payment_confirmation_date`), `employeeData.baseSalary`, `employeeData.commission`, sum of `employeeData.bonus` and `employeeData.targetBonus`, `employeeData.deductions`, `employeeData.loans`, `employeeData.salesAmount`, and `employeeDetailsFromQuery?.salary_plan_id`.
    *   It fetches `salaryPlan.name` based on `selectedEmployeeForPayslip`, which needs adjustment to be specific to the employee being confirmed.
    *   It was attempting to fetch `currentUser` for a `created_by` field, which is no longer needed.
*   **Logic Update Plan:**
    1.  **Access Data:** The function already receives `paymentDate` (from `PaymentConfirmationDialog`), `employeeId`, and `employeeData` (the `EmployeeSalary` object from `useSalaryData`). It also receives `employeeDetailsFromQuery` which contains details like `salary_plan_id`.
    2.  **Loading States:** Implement `isConfirmingPayment` (or similar) for UI feedback during the process.
    3.  **Iterate (if applicable):** The current `handlePaymentConfirm` seems to be for a single employee confirmation at a time, which aligns with the context of the `PaymentConfirmationDialog`. If batch confirmation is ever introduced, this would need iteration. For now, assume single employee confirmation.
    4.  **For each `employeeData` (effectively, the single one being confirmed):**
        *   **Retrieve Employee Details:**
            *   `employee.id`: Available as `employeeId`.
            *   `employee.name`: Available as `employeeData.name` (for `employee_name_snapshot`).
            *   `employee.salary_plan_id`: Available from `employeeDetailsFromQuery?.salary_plan_id`.
        *   **Fetch `salary_plan_name_snapshot`:**
            *   The current logic `currentSalaryPlanName = selectedEmployeeForPayslip === employeeId && salaryPlan ? salaryPlan.name : null;` is insufficient.
            *   **Action:** Modify to fetch the specific salary plan name using `employeeDetailsFromQuery?.salary_plan_id`. This might involve:
                *   Ensuring the full list of `salaryPlans` is available in `SalaryTable.tsx` and finding the name by ID. (Implemented: Fetched `allSalaryPlans` and used `find`.)
                *   Or, making a direct Supabase call within `handlePaymentConfirm` to get the plan name: `supabase.from('salary_plans').select('name').eq('id', employeeDetailsFromQuery.salary_plan_id).single()`. This needs to be efficient and handle cases where the plan might be missing.
        *   **Construct `snapshotRecord` Object:**
            ```typescript
            // Example structure, to be refined in implementation
            const snapshotRecord = {
              employee_id: employeeId,
              employee_name_snapshot: employeeData.name,
              month_year: format(paymentDate, 'yyyy-MM'), // from existing logic
              payment_confirmation_date: format(paymentDate, 'yyyy-MM-dd'), // from existing logic (effective_date)
              base_salary: employeeData.baseSalary,
              sales_amount: employeeData.salesAmount || 0,
              commission_amount: employeeData.commission || 0,
              total_bonuses: (employeeData.bonus || 0) + (employeeData.targetBonus || 0), // from existing logic
              total_deductions: employeeData.deductions || 0, // from existing logic
              total_loan_repayments: employeeData.loans || 0, // from existing logic
              net_salary_paid: employeeData.total, // Ensure this is correctly populated
              salary_plan_id_snapshot: employeeDetailsFromQuery?.salary_plan_id || null,
              salary_plan_name_snapshot: /* fetched salary plan name */,
              calculation_details_json: JSON.stringify(employeeData)
              // confirmed_by_user_id is removed
            };
            ```
        *   **Remove `change_type`:** The `change_type: 'salary_payout'` field from the old `recordToInsertObject` is not needed for the new table.
    5.  **Pre-confirmation Validation:** The existing NaN checks are good. Retain them.
*   **Supabase Call Update:** This will be handled in Sub-Task 2.1.2.

> ⚠️ **WARNING: Do not change any calculation logic in this function - only snapshot the values calculated by `useSalaryData`**
> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress. (Completed)

#### Sub-Task 2.1.2: Update Supabase Insert Call (20% Complete - Type Definition Issues)
*   **File:** Same as Sub-Task 2.1.1.
*   **Action:**
    *   Modify the Supabase call:
      `const { data, error } = await supabase.from('employee_monthly_salary').insert([snapshotRecord]).select();` (Note: Changed to insert an array `[snapshotRecord]`)
    *   Ensure robust error logging and user feedback (e.g., toast notifications for success/failure). (Basic console logging implemented; UI toasts are a future enhancement).
    *   The `onConfirm` prop passed to `PaymentConfirmationDialog.tsx` should return a promise that resolves to `true` on successful insert, `false` otherwise, or throw an error to be caught by the caller. (Implemented).
    *   Handle potential batch insert failures (Supabase typically treats batch inserts as a single transaction; all succeed or all fail). (Current implementation is single insert).
    *   Reset loading states (`isConfirmingPayment`) in a `finally` block. (Implemented).
*   **Current Status:** A type definition issue was identified in the Supabase client configuration. The TypeScript types for the newly created `employee_monthly_salary` table aren't properly recognized by the supabase client instance. 

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

---
### **Troubleshooting Log (Updated 2024-MM-DD)**

**Issue:** The payment confirmation is still not working, and we've identified that the problem originates from the Supabase client configuration after recent changes to `client.ts`.

**Root Cause Analysis:**

1. **TypeScript Type Definitions:**
   - The Database type in the Supabase client imports from `@/types/supabase` instead of the original location.
   - Although `employee_monthly_salary` table exists in the Supabase database and appears in the type definitions (as verified by grep searches), it's not properly recognized by the TypeScript compiler.
   - This causes TypeScript errors when trying to use `supabase.from('employee_monthly_salary')` although the table exists in the database.

2. **Event Propagation Issues:**
   - Fixed multiple event propagation issues in the PaymentConfirmation dialog and SalaryTable component.
   - The calendar left arrow was triggering navigation in SalaryBreakdown component due to event bubbling.

3. **RLS Policy:**
   - RLS has been disabled on the `employee_monthly_salary` table (as mentioned by the user), so permissions shouldn't be the blocking issue anymore.

**Next Steps:**

1. **Type Definition Fix (Highest Priority):**
   - Regenerate Supabase type definitions to correctly include the new `employee_monthly_salary` table.
   - Add a custom type definition for the table if regeneration isn't working.
   - Update the Supabase client to correctly use the updated types.

2. **Client Update:**
   ```typescript
   // Step 1: Generate a fresh set of types:
   // npx supabase gen types typescript --project-id <YOUR_PROJECT_ID> > src/types/supabase.ts
   
   // Step 2: Update the client.ts file to explicitly recognize the employee_monthly_salary table:
   import { createClient } from '@supabase/supabase-js';
   import type { Database } from '@/types/supabase';
   
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jfnjvphxhzxojxgptmtu.supabase.co";
   const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "...";
   
   // Custom type extension if needed
   type CustomDatabase = Database & {
     public: {
       Tables: {
         employee_monthly_salary: {
           Row: {
             id: string;
             employee_id: string;
             employee_name_snapshot: string;
             month_year: string;
             payment_confirmation_date: string;
             base_salary: number;
             sales_amount?: number;
             commission_amount?: number;
             total_bonuses?: number;
             total_deductions?: number;
             total_loan_repayments?: number;
             net_salary_paid: number;
             salary_plan_id_snapshot?: string;
             salary_plan_name_snapshot?: string;
             calculation_details_json?: any;
             created_at?: string;
             updated_at?: string;
           };
           Insert: {
             /* Similar to Row but with optional fields */
           };
           Update: {
             /* Similar to Insert */
           };
         };
       };
     };
   };
   
   export const supabase = createClient<CustomDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
   ```

3. **Testing After Type Fix:**
   - After implementing the type fix, test again with improved logging.
   - If needed, implement direct debugging using browser developer tools.
   - Consider a fallback approach of writing a raw SQL function in Supabase that can be called with RPC if TypeScript types continue to cause issues.

---

### Phase 3: Frontend - New "Salary History" Sub-Tab in Salary Dashboard (0% Complete - BLOCKED by Phase 2 Issue)

> ⚠️ **WARNING: This phase only involves adding a new display tab. DO NOT modify the salary calculation logic.**
> This phase is blocked until the payment confirmation insertion (Phase 2) is fully functional and tested.

#### Sub-Task 3.1.1: Add New Tab to Salary Dashboard (0% Complete)
*   **File:** `src/components/admin/employee-management/salary/SalaryDashboard.tsx`
*   **UI Element:**
    *   In the `<Tabs>` component, add a new `<TabsTrigger value="history">Salary History</TabsTrigger>`.
    *   Add a corresponding `<TabsContent value="history">...</TabsContent>` section.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 3.1.2: Create Data Fetching Hook for Salary History (0% Complete)
*   **File Path (New):** `src/components/admin/employee-management/salary/hooks/useSalaryHistorySnapshots.ts`
*   **Type Definition (Example for hook filters):**
    ```typescript
    export interface SalaryHistoryFilters {
      employeeId?: string;
      monthYear?: string; // YYYY-MM
      startDate?: string; // YYYY-MM-DD (for payment_confirmation_date range)
      endDate?: string;   // YYYY-MM-DD (for payment_confirmation_date range)
      sortBy?: string;    // Column name for sorting
      sortOrder?: 'asc' | 'desc';
      limit?: number;
      offset?: number;
    }
    ```
*   **Function Signature:** `export const useSalaryHistorySnapshots = (filters: SalaryHistoryFilters) => { ... }`
*   **Logic:**
    *   Uses `@tanstack/react-query` (`useQuery`).
    *   Query key should include all filter parameters to ensure proper caching and refetching.
    *   Constructs a Supabase query to `employee_monthly_salary`.
        ```javascript
        // Inside useQuery's queryFn
        let query = supabase
          .from('employee_monthly_salary')
          .select('*', { count: 'exact' }); // Fetch count for pagination

        if (filters.employeeId) query = query.eq('employee_id', filters.employeeId);
        if (filters.monthYear) query = query.eq('month_year', filters.monthYear);
        if (filters.startDate) query = query.gte('payment_confirmation_date', filters.startDate);
        if (filters.endDate) query = query.lte('payment_confirmation_date', filters.endDate);
        
        const sortBy = filters.sortBy || 'payment_confirmation_date';
        const sortOrderAsc = (filters.sortOrder || 'desc') === 'asc';
        query = query.order(sortBy, { ascending: sortOrderAsc });

        if (filters.limit) query = query.limit(filters.limit);
        if (filters.offset) query = query.range(filters.offset, filters.offset + filters.limit - 1);
        
        const { data, error, count } = await query;

        if (error) throw error; // React Query will catch this

        return { historySnapshots: data || [], totalCount: count || 0 };
        ```
    *   Returns `{ data: { historySnapshots, totalCount }, isLoading, error, refetch }` from `useQuery`.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 3.1.3: Design and Implement Salary History Display Component (0% Complete)
*   **File Path (New):** `src/components/admin/employee-management/salary/components/SalaryHistorySnapshotsTable.tsx`
*   **Type Definition for Snapshot Record (derived from DB table):**
    ```typescript
    // Define this type based on the actual columns of employee_monthly_salary
    export type SalarySnapshotRecord = {
      id: string;
      employee_id: string;
      employee_name_snapshot: string;
      month_year: string;
      payment_confirmation_date: string; // Consider formatting to Date object if needed
      base_salary: number;
      sales_amount?: number;
      commission_amount?: number;
      total_bonuses?: number;
      total_deductions?: number;
      total_loan_repayments?: number;
      net_salary_paid: number;
      salary_plan_id_snapshot?: string;
      salary_plan_name_snapshot?: string;
      calculation_details_json?: any; // Or a more specific type if EmployeeSalary is imported
      confirmed_by_user_id?: string;
      created_at: string;
      // Add other fields like currency if implemented
    };
    ```
*   **Props:**
    ```typescript
    interface SalaryHistorySnapshotsTableProps {
      snapshots: SalarySnapshotRecord[];
      isLoading: boolean;
      // Potentially add props for column visibility, custom renderers, etc.
      // Pagination and sorting controls might be part of this component or parent
    }
    ```
*   **UI Element:** A table component (e.g., using `@/components/ui/table`).
*   **Columns to Display (suggestion):**
    *   `Employee Name (Snapshot)`
    *   `Month/Year` (Pay Period)
    *   `Payment Confirmation Date` (Formatted)
    *   `Salary Plan (Snapshot)`
    *   `Base Salary` (Formatted currency)
    *   `Sales Amount` (Formatted currency)
    *   `Commission Amount` (Formatted currency)
    *   `Total Bonuses` (Formatted currency)
    *   `Total Deductions` (Formatted currency)
    *   `Total Loan Repayments` (Formatted currency)
    *   `Net Salary Paid` (Formatted currency)
    *   `Confirmed By` (User ID, or fetch user details if needed – could be a separate enhancement)
    *   Action column: "View Details" button/icon to open a modal/drawer displaying the formatted `calculation_details_json`.
*   **Features:**
    *   Display loading state (e.g., skeleton rows).
    *   Handle empty state gracefully ("No salary history found for the selected filters.").
    *   Column header clicking for sorting (triggers `onSortChange` passed from parent).
    *   Modal/Drawer for "View Details" should pretty-print the JSON or display it in a structured way.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 3.1.4: Integrate History Display into Salary Dashboard Tab (0% Complete)
*   **File:** `src/components/admin/employee-management/salary/SalaryDashboard.tsx`
*   **Inside `<TabsContent value="history">`:**
    1.  **State Management for Filters and Pagination:**
        *   Use `useState` for filter values (`filters: SalaryHistoryFilters`). Initialize with defaults.
        *   Use `useState` for pagination (`currentPage: number`, `itemsPerPage: number`).
    2.  **UI Elements for Filtering:**
        *   Employee Selector (Dropdown): Populate with employees list. Updates `filters.employeeId`.
        *   Month/Year Picker: Updates `filters.monthYear`.
        *   Date Range Picker for `payment_confirmation_date`: Updates `filters.startDate` and `filters.endDate`.
        *   "Apply Filters" Button: Triggers refetch or updates filter state.
        *   "Reset Filters" Button: Resets filters to default and refetches.
    3.  **Data Fetching:**
        *   Calculate `offset` based on `currentPage` and `itemsPerPage`.
        *   Call `useSalaryHistorySnapshots` with current `filters` (including pagination `limit`, `offset`, and sorting).
        *   `const { data, isLoading, error, refetch } = useSalaryHistorySnapshots({ ...filters, limit: itemsPerPage, offset });`
    4.  **Display:**
        *   Render filter components.
        *   Render `<SalaryHistorySnapshotsTable snapshots={data?.historySnapshots || []} isLoading={isLoading} />`.
        *   Render a pagination component (e.g., `@/components/ui/pagination`) connected to `totalCount` from hook, `currentPage`, `itemsPerPage`. `onPageChange` should update `currentPage` state.
    5.  **Sorting Integration:**
        *   Table headers in `SalaryHistorySnapshotsTable` should trigger a callback (e.g., `handleSortChange(newSortBy: string)`) in `SalaryDashboard.tsx`.
        *   `handleSortChange` updates the `sortBy` and `sortOrder` in the `filters` state, toggling `sortOrder` if the same column is clicked.
    6.  **Export Feature (Optional Enhancement):**
        *   Add an "Export to CSV/Excel" button that uses the currently filtered and sorted `historySnapshots` data.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

### Phase 4: Testing and Refinement

> ⚠️ **WARNING: During testing, ensure that all salary calculations remain intact. Validation should only verify that the snapshot system accurately reflects the frontend calculations.**

#### Sub-Task 4.1.1: Test Payment Confirmation Thoroughly (0% Complete)
*   Confirm payment for a single employee. Verify all fields in `employee_monthly_salary` including `employee_name_snapshot`, `salary_plan_name_snapshot`, all monetary values, and `calculation_details_json`.
*   Confirm payments for multiple employees if batch confirmation is supported.
*   Test edge cases: zero values, null values for optional fields (e.g., `salary_plan_id_snapshot` if employee has no plan).
*   Verify `confirmed_by_user_id` is correctly populated.
*   Test behavior if `Employee` or `SalaryPlan` details are missing during snapshot creation.
*   Test error handling during Supabase insert (e.g., network issues, RLS violations if not admin).

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 4.1.2: Test "Salary History" Tab Functionality (0% Complete)
*   Verify data display accuracy in `SalaryHistorySnapshotsTable`, including formatting of dates and currency.
*   Test all filters (employee, month/year, date range) individually and in combination. Ensure "Reset Filters" works.
*   Test pagination thoroughly: navigation, correct number of items per page, total count display.
*   Test column sorting for all sortable columns (ascending/descending).
*   Test "View Details" modal: correct JSON displayed, good formatting.
*   Test UI responsiveness, loading states (skeletons, spinners), and empty states for table and filters.
*   Test with different user roles if complex RLS is implemented.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 4.1.3: Code Review and Cleanup (0% Complete)
*   Review all new and modified code for clarity, correctness, performance, and adherence to project standards (DRY, descriptive naming, etc.).
*   Address any new console errors or linter warnings.
*   Ensure proper error handling and user feedback (e.g., toasts) for all operations.
*   Verify accessibility of new UI components.

> ⚠️ **WARNING: Ensure no changes were made to salary calculation logic during code cleanup.**
> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 4.1.4: Documentation (0% Complete)
*   Update any internal developer documentation regarding the new salary confirmation flow and data structures.
*   If applicable, create or update user guides for admins using the new Salary History feature.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

### Phase 5: Future Considerations (Optional)

> ⚠️ **WARNING: These are optional enhancements. Any future implementation must preserve the existing salary calculation logic.**

#### Sub-Task 5.1.1: Data Migration from `salary_history_archived` (0% Complete)
*   If historical data from the old `salary_history_archived` table is critical and needs to be in the new `employee_monthly_salary` format, plan and implement a one-time migration script. This might involve mapping old columns to new ones and potentially transforming data.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 5.1.2: Enhanced Auditability (0% Complete)
*   Consider logging specific changes or corrections if a snapshot can be modified (though current plan implies immutable snapshots).
*   If `calculation_details_json` proves too unwieldy for common queries, consider promoting more fields from it to dedicated columns.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

#### Sub-Task 5.1.3: Advanced Reporting/Analytics (0% Complete)
*   Build capabilities for more advanced analytics on top of the salary snapshot data (e.g., trends, comparisons). This is beyond the initial scope but the structured data facilitates it.

> 📝 **After Completion:** Update the plan to mark this sub-task as complete and update the overall progress.

This detailed plan provides a comprehensive roadmap for implementing the new salary payment confirmation and history system. Remember to replace placeholder values (like `'your_actual_admin_auth_user_id'`) with actual project-specific configurations.
The review of the `EmployeeSalary` type (Sub-Task 1.1.5) is critical to ensure the accuracy of the stored snapshots. 