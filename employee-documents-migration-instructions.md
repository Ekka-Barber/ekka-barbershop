# Employee Documents Migration Instructions

This document provides instructions for implementing the employee documents tracking system in Supabase.

## Prerequisites

- Access to Supabase dashboard with admin privileges
- Existing `employees` table with at least the following columns:
  - `id` (UUID, primary key)
  - `name` (text)
  - `branch_id` (UUID, foreign key to branches table)

## Implementation Steps

### Step 1: Run SQL Migration Script

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor section
3. Create a new query
4. Copy the entire contents of the `employee-documents-migration.sql` file
5. Run the script

This script will:
- Create the `employee_documents` table with all necessary columns
- Set up indexes for performance optimization
- Configure Row Level Security (RLS) policies
- Create a trigger for updating the `updated_at` timestamp
- Populate sample data for all existing employees
- Create a view with calculated status information

### Step 2: Verify Table Creation

1. In the Supabase dashboard, navigate to the Table Editor
2. Confirm that the `employee_documents` table appears in the list
3. Check that the `employee_documents_with_status` view also appears

### Step 3: Update TypeScript Types for Supabase (Optional)

If you're using TypeScript type generation for Supabase:

1. Run the type generation command for your project:
   ```
   npx supabase gen types typescript --project-id your-project-id --schema public > src/types/supabase-types.ts
   ```
2. This will update your type definitions to include the new tables and views

### Step 4: Test the Integration

1. Use the Supabase SQL Editor to run some test queries:

```sql
-- View all documents
SELECT * FROM employee_documents;

-- View documents with calculated status
SELECT * FROM employee_documents_with_status;

-- View expiring documents
SELECT * FROM employee_documents_with_status WHERE status = 'expiring_soon';

-- View expired documents
SELECT * FROM employee_documents_with_status WHERE status = 'expired';
```

2. Ensure the documents are properly associated with employees:

```sql
-- Join with employees to check relationship
SELECT d.id, d.document_name, d.expiry_date, d.status, e.name as employee_name
FROM employee_documents_with_status d
JOIN employees e ON d.employee_id = e.id
ORDER BY e.name, d.expiry_date;
```

## Data Structure

### employee_documents Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| employee_id | UUID | Foreign key to employees table |
| document_type | TEXT | Type of document (health_certificate, residency_permit, work_license, custom) |
| document_name | TEXT | Name of the document |
| document_number | TEXT | Identification number of the document |
| issue_date | TIMESTAMP | Date when the document was issued |
| expiry_date | TIMESTAMP | Date when the document expires |
| duration_months | INTEGER | Duration of validity in months |
| notification_threshold_days | INTEGER | Days before expiry to start notifications |
| document_url | TEXT | URL to the document file |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Record creation date |
| updated_at | TIMESTAMP | Record last update date |

### employee_documents_with_status View

This view includes all columns from the base table plus:

| Column | Type | Description |
|--------|------|-------------|
| employee_name | TEXT | Name of the employee |
| branch_id | UUID | Branch ID of the employee |
| status | TEXT | Calculated status (valid, expiring_soon, expired) |
| days_remaining | INTEGER | Days remaining until expiry |

## Troubleshooting

### Common Issues

1. **Permission errors**: Ensure the RLS policy is correctly set up and the user has the necessary permissions

2. **Foreign key constraints**: Make sure all employee IDs exist in the employees table

3. **Type conversion errors**: Ensure date formats are correct when inserting/updating data

4. **Missing UUIDs**: If you get errors about missing UUIDs, make sure the uuid-ossp extension is enabled:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### Data Cleanup

If you need to reset the documents data:

```sql
-- Delete all documents
DELETE FROM employee_documents;

-- Re-run the population function
SELECT populate_employee_documents();
``` 