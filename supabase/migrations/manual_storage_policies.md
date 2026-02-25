# Storage Policies - COMPLETED

## Status: ALL POLICIES FIXED (Feb 2026)

All storage policies have been updated to work with the custom access code authentication system.

## What Was Fixed

### Problem
Storage policies were checking for `authenticated` role, but our app uses **custom access code authentication** (not Supabase Auth). This meant:
- Managers logging in with access codes were NOT in `authenticated` role
- Storage policies blocked access to photos, receipts, etc.

### Solution
Updated ALL storage policies to use `can_access_business_data()` function which checks our custom session variables (`app.owner_access`, `app.branch_manager_code`, `app.current_hr_access_code`).

## Current Policy Configuration

### employee_photos bucket
| Operation | Policy Name | Access Control |
|-----------|-------------|----------------|
| SELECT | Business users can read employee_photos | `can_access_business_data()` |
| INSERT | Business users can upload employee_photos | `can_access_business_data()` |
| UPDATE | Business users can update employee_photos | `can_access_business_data()` |
| DELETE | Business users can delete employee_photos | `can_access_business_data()` |

### receipts bucket
| Operation | Policy Name | Access Control |
|-----------|-------------|----------------|
| SELECT | Business users can read receipts | `can_access_business_data()` |
| INSERT | Business users can upload receipts | `can_access_business_data()` |
| UPDATE | Business users can update receipts | `can_access_business_data()` |
| DELETE | Business users can delete receipts | `can_access_business_data()` |

### sponsor_documents bucket
| Operation | Policy Name | Access Control |
|-----------|-------------|----------------|
| SELECT | Business users can read sponsor documents | `can_access_business_data()` |
| INSERT | Business users can upload sponsor documents | `can_access_business_data()` |
| UPDATE | Business users can update sponsor documents | `can_access_business_data()` |
| DELETE | Business users can delete sponsor documents | `can_access_business_data()` |

### marketing_files bucket
| Operation | Policy Name | Access Control |
|-----------|-------------|----------------|
| SELECT | Public read marketing_files | `public` (customers need to view) |
| SELECT | Allow public access to marketing files | `public` |
| ALL | Business users can manage marketing_files | `can_access_business_data()` |

## How `can_access_business_data()` Works

```sql
CREATE OR REPLACE FUNCTION public.can_access_business_data()
RETURNS boolean AS $$
  select coalesce(
    public.get_cached_access_role() in ('owner', 'manager', 'super_manager', 'hr'),
    false
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

This function:
1. Gets the cached access role from session variables
2. Returns `true` if the role is owner, manager, super_manager, or hr
3. Returns `false` otherwise

## Access Code Tables Fixed

Added `name` column to:
- `owner_access` - Now has `name` column
- `hr_access` - Now has `name` column
- `branch_managers` - Already had `name` column

## No Manual Action Required

All changes have been applied via migrations. The storage policies are now properly configured.
