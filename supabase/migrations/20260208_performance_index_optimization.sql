-- Performance optimization: Add indexes for foreign key constraints and remove unused indexes
-- Date: 2026-02-08

-- Add index for marketing_files_branch_name foreign key constraint
CREATE INDEX IF NOT EXISTS idx_marketing_files_branch_name
ON marketing_files(branch_name)
WHERE branch_name IS NOT NULL;

-- Add indexes for foreign key constraints to improve join performance
CREATE INDEX IF NOT EXISTS idx_branch_managers_branch_id
ON branch_managers(branch_id)
WHERE branch_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employee_bonuses_employee_id
ON employee_bonuses(employee_id)
WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id
ON employee_documents(employee_id)
WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employee_holidays_employee_id
ON employee_holidays(employee_id)
WHERE employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_employees_sponsor_id
ON employees(sponsor_id)
WHERE sponsor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_marketing_files_branch_id
ON marketing_files(branch_id)
WHERE branch_id IS NOT NULL;

-- Remove unused indexes (30 indexes dropped to optimize storage and maintenance)
DROP INDEX IF EXISTS idx_employees_sponsor_id;
DROP INDEX IF EXISTS idx_review_avatar_cache_last_accessed;
DROP INDEX IF EXISTS idx_branch_managers_branch_id;
DROP INDEX IF EXISTS idx_qr_scans_location;
DROP INDEX IF EXISTS idx_review_avatar_cache_refresh;
DROP INDEX IF EXISTS idx_marketing_files_category_active;
DROP INDEX IF EXISTS idx_employee_documents_employee_id;
DROP INDEX IF EXISTS idx_employee_holidays_employee_date;
DROP INDEX IF EXISTS idx_marketing_files_active_category;
DROP INDEX IF EXISTS idx_salary_plans_config;
DROP INDEX IF EXISTS idx_employee_documents_expiry_type_employee;
DROP INDEX IF EXISTS idx_employee_documents_document_type;
DROP INDEX IF EXISTS idx_employee_documents_name_search;
DROP INDEX IF EXISTS idx_employee_documents_number;
DROP INDEX IF EXISTS idx_employee_documents_issue_date;
DROP INDEX IF EXISTS idx_employee_documents_expiry_date;
DROP INDEX IF EXISTS idx_employee_documents_employee_expiry;
DROP INDEX IF EXISTS idx_employee_documents_created_at;
DROP INDEX IF EXISTS idx_employee_bonuses_lookup;
DROP INDEX IF EXISTS idx_employee_bonuses_employee_id;
DROP INDEX IF EXISTS idx_employee_bonuses_date;
DROP INDEX IF EXISTS idx_employee_deductions_employee_id;
DROP INDEX IF EXISTS idx_employee_sales_employee_id;
DROP INDEX IF EXISTS idx_employee_holidays_employee_id;
DROP INDEX IF EXISTS idx_employee_holidays_date;
DROP INDEX IF EXISTS idx_marketing_files_branch_id;
DROP INDEX IF EXISTS idx_marketing_files_category_display_order;
DROP INDEX IF EXISTS idx_marketing_files_end_date;
DROP INDEX IF EXISTS idx_marketing_files_created_at;
DROP INDEX IF EXISTS idx_ui_elements_is_visible_idx;
DROP INDEX IF EXISTS idx_employee_documents_document_type;
